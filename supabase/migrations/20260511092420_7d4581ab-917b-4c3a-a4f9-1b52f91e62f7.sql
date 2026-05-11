
-- ==========================================================
-- ENUMS
-- ==========================================================
CREATE TYPE public.app_role AS ENUM (
  'admin','warehouse_manager','receiver','counter','issuer','auditor','viewer'
);

CREATE TYPE public.movement_type AS ENUM (
  'RECEIVE','ISSUE','TRANSFER_OUT','TRANSFER_IN',
  'ADJUST','COUNT_VARIANCE','RETURN','DAMAGE'
);

-- ==========================================================
-- PROFILES & ROLES
-- ==========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  default_site_id UUID,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  site_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, site_id)
);

-- has_role security definer (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  -- Default role: viewer
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_touch
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ==========================================================
-- SITES & LOCATIONS
-- ==========================================================
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_default_site_fk
  FOREIGN KEY (default_site_id) REFERENCES public.sites(id) ON DELETE SET NULL;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_site_fk
  FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;

CREATE TABLE public.stock_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SHELF',
  parent_id UUID REFERENCES public.stock_locations(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, code)
);
CREATE INDEX idx_locations_site ON public.stock_locations(site_id);

-- ==========================================================
-- UNITS, CATEGORIES, VENDORS, ITEMS
-- ==========================================================
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_weight BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  base_unit_id UUID NOT NULL REFERENCES public.units(id),
  is_perishable BOOLEAN NOT NULL DEFAULT FALSE,
  reorder_point NUMERIC(18,4),
  reorder_qty NUMERIC(18,4),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_items_barcode ON public.items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_items_active ON public.items(is_active) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_items_touch
BEFORE UPDATE ON public.items
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.item_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id),
  factor_to_base NUMERIC(18,6) NOT NULL CHECK (factor_to_base > 0),
  barcode TEXT,
  is_default_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  is_default_issue BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, unit_id)
);

CREATE TABLE public.item_vendors (
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  vendor_sku TEXT,
  last_cost NUMERIC(18,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, vendor_id)
);

-- ==========================================================
-- STOCK STATE & LEDGER
-- ==========================================================
CREATE TABLE public.stock_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.stock_locations(id) ON DELETE CASCADE,
  qty_on_hand NUMERIC(18,4) NOT NULL DEFAULT 0,
  qty_reserved NUMERIC(18,4) NOT NULL DEFAULT 0,
  avg_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
  last_movement_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, location_id),
  CHECK (qty_on_hand >= 0)
);
CREATE INDEX idx_balance_item ON public.stock_balances(item_id);
CREATE INDEX idx_balance_loc ON public.stock_balances(location_id);

CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_no TEXT UNIQUE NOT NULL,
  type public.movement_type NOT NULL,
  item_id UUID NOT NULL REFERENCES public.items(id),
  location_id UUID NOT NULL REFERENCES public.stock_locations(id),
  qty_base NUMERIC(18,4) NOT NULL,
  qty_input NUMERIC(18,4) NOT NULL,
  unit_id UUID NOT NULL REFERENCES public.units(id),
  factor_to_base NUMERIC(18,6) NOT NULL,
  qty_before NUMERIC(18,4) NOT NULL,
  qty_after NUMERIC(18,4) NOT NULL,
  unit_cost NUMERIC(18,4),
  ref_type TEXT,
  ref_id UUID,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  request_id TEXT UNIQUE
);
CREATE INDEX idx_mv_item_loc_time ON public.stock_movements(item_id, location_id, performed_at DESC);
CREATE INDEX idx_mv_ref ON public.stock_movements(ref_type, ref_id);
CREATE INDEX idx_mv_performed_by ON public.stock_movements(performed_by);

-- Transactional movement function
CREATE OR REPLACE FUNCTION public.post_stock_movement(
  p_item UUID, p_loc UUID, p_type public.movement_type,
  p_qty_base NUMERIC, p_unit UUID, p_factor NUMERIC,
  p_qty_input NUMERIC, p_cost NUMERIC,
  p_ref_type TEXT, p_ref_id UUID,
  p_user UUID, p_request_id TEXT, p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_before NUMERIC; v_after NUMERIC; v_id UUID; v_no TEXT;
BEGIN
  IF p_request_id IS NOT NULL THEN
    SELECT id INTO v_id FROM public.stock_movements WHERE request_id = p_request_id;
    IF FOUND THEN RETURN v_id; END IF;
  END IF;

  INSERT INTO public.stock_balances(item_id, location_id)
    VALUES (p_item, p_loc)
    ON CONFLICT (item_id, location_id) DO NOTHING;

  SELECT qty_on_hand INTO v_before
    FROM public.stock_balances
    WHERE item_id = p_item AND location_id = p_loc
    FOR UPDATE;

  v_after := v_before + p_qty_base;
  IF v_after < 0 THEN
    RAISE EXCEPTION 'Negative stock: have %, delta %', v_before, p_qty_base;
  END IF;

  UPDATE public.stock_balances
     SET qty_on_hand = v_after,
         avg_cost = CASE
           WHEN p_qty_base > 0 AND p_cost IS NOT NULL AND v_after > 0
             THEN ((qty_on_hand * avg_cost) + (p_qty_base * p_cost)) / v_after
           ELSE avg_cost END,
         last_movement_at = now(),
         updated_at = now()
   WHERE item_id = p_item AND location_id = p_loc;

  v_no := 'MV-' || to_char(now(),'YYYYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,8);

  INSERT INTO public.stock_movements(
    movement_no, type, item_id, location_id,
    qty_base, qty_input, unit_id, factor_to_base,
    qty_before, qty_after, unit_cost,
    ref_type, ref_id, performed_by, request_id, notes)
  VALUES (
    v_no, p_type, p_item, p_loc, p_qty_base, p_qty_input, p_unit, p_factor,
    v_before, v_after, p_cost, p_ref_type, p_ref_id, p_user, p_request_id, p_notes)
  RETURNING id INTO v_id;

  RETURN v_id;
END $$;

-- ==========================================================
-- GOODS RECEIVING
-- ==========================================================
CREATE TABLE public.goods_receiving (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receive_no TEXT UNIQUE NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  invoice_no TEXT NOT NULL,
  invoice_date DATE,
  site_id UUID NOT NULL REFERENCES public.sites(id),
  received_by UUID NOT NULL REFERENCES auth.users(id),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'DRAFT',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('DRAFT','POSTED','CANCELLED'))
);
CREATE INDEX idx_gr_vendor ON public.goods_receiving(vendor_id);
CREATE INDEX idx_gr_site ON public.goods_receiving(site_id);
CREATE INDEX idx_gr_received_at ON public.goods_receiving(received_at DESC);
CREATE TRIGGER trg_gr_touch
BEFORE UPDATE ON public.goods_receiving
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.goods_receiving_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gr_id UUID NOT NULL REFERENCES public.goods_receiving(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id),
  location_id UUID NOT NULL REFERENCES public.stock_locations(id),
  unit_id UUID NOT NULL REFERENCES public.units(id),
  qty NUMERIC(18,4) NOT NULL CHECK (qty > 0),
  qty_base NUMERIC(18,4) NOT NULL,
  unit_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
  lot_no TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gri_gr ON public.goods_receiving_items(gr_id);

-- ==========================================================
-- ATTACHMENTS & AUDIT
-- ==========================================================
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'PHOTO',
  storage_key TEXT NOT NULL,
  mime TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_attachments_entity ON public.attachments(entity, entity_id);

CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  diff JSONB,
  actor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity, entity_id);

-- ==========================================================
-- ROW LEVEL SECURITY
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receiving ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receiving_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- user_roles
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manages roles" ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

-- master data: read for all authenticated, write for admin/manager
CREATE POLICY "auth read sites" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "mgr write sites" ON public.sites FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'));

CREATE POLICY "auth read locations" ON public.stock_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "mgr write locations" ON public.stock_locations FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'));

CREATE POLICY "auth read units" ON public.units FOR SELECT TO authenticated USING (true);
CREATE POLICY "mgr write units" ON public.units FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'));

CREATE POLICY "auth read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "mgr write categories" ON public.categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'));

CREATE POLICY "auth read vendors" ON public.vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "mgr write vendors" ON public.vendors FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'));

CREATE POLICY "auth read items" ON public.items FOR SELECT TO authenticated USING (true);
CREATE POLICY "mgr write items" ON public.items FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'));

CREATE POLICY "auth read item_units" ON public.item_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "mgr write item_units" ON public.item_units FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'));

CREATE POLICY "auth read item_vendors" ON public.item_vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "mgr write item_vendors" ON public.item_vendors FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'));

-- stock balances: read all, no direct writes (function only)
CREATE POLICY "auth read balances" ON public.stock_balances FOR SELECT TO authenticated USING (true);

-- stock movements: read all, inserts via SECURITY DEFINER function only
CREATE POLICY "auth read movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);

-- goods receiving
CREATE POLICY "auth read gr" ON public.goods_receiving FOR SELECT TO authenticated USING (true);
CREATE POLICY "receivers create gr" ON public.goods_receiving FOR INSERT TO authenticated
WITH CHECK (
  received_by = auth.uid() AND (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'warehouse_manager') OR
    public.has_role(auth.uid(),'receiver')
  )
);
CREATE POLICY "receivers update own gr" ON public.goods_receiving FOR UPDATE TO authenticated
USING (
  (received_by = auth.uid() AND status = 'DRAFT') OR
  public.has_role(auth.uid(),'admin') OR
  public.has_role(auth.uid(),'warehouse_manager')
);
CREATE POLICY "mgr delete gr" ON public.goods_receiving FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'warehouse_manager'));

CREATE POLICY "auth read gri" ON public.goods_receiving_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "edit gri via parent" ON public.goods_receiving_items FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.goods_receiving gr
  WHERE gr.id = gr_id AND (
    (gr.received_by = auth.uid() AND gr.status = 'DRAFT') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'warehouse_manager')
  )
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.goods_receiving gr
  WHERE gr.id = gr_id AND (
    (gr.received_by = auth.uid() AND gr.status = 'DRAFT') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'warehouse_manager')
  )
));

-- attachments
CREATE POLICY "auth read attachments" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth upload attachments" ON public.attachments FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "owner delete attachments" ON public.attachments FOR DELETE TO authenticated
USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- audit logs
CREATE POLICY "admin/auditor read audit" ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'auditor'));

-- ==========================================================
-- STORAGE BUCKET for invoice photos
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('sms-attachments', 'sms-attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "auth read sms attachments" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'sms-attachments');

CREATE POLICY "auth upload sms attachments" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'sms-attachments' AND owner = auth.uid());

CREATE POLICY "auth delete own sms attachments" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'sms-attachments' AND owner = auth.uid());
