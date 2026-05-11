
-- 1) search_path on trigger helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- 2) Revoke broad EXECUTE on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.post_stock_movement(
  uuid, uuid, public.movement_type, numeric, uuid, numeric,
  numeric, numeric, text, uuid, uuid, text, text
) FROM PUBLIC, anon;

-- Keep needed grants
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.post_stock_movement(
  uuid, uuid, public.movement_type, numeric, uuid, numeric,
  numeric, numeric, text, uuid, uuid, text, text
) TO authenticated;
