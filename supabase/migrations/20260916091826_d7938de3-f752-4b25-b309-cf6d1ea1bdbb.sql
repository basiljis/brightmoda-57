
REVOKE EXECUTE ON FUNCTION public.tenant_is_active(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.can_edit_tenant(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.tenant_is_active(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_tenant(uuid) TO authenticated;
