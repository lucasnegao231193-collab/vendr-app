-- Corrigir função vendedor_id_for_user
-- O problema estava na referência ao parâmetro

CREATE OR REPLACE FUNCTION public.vendedor_id_for_user(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT id FROM public.vendedores 
    WHERE vendedores.user_id = vendedor_id_for_user.user_id 
    LIMIT 1
  );
END;
$$;

-- Testar a função
-- SELECT public.vendedor_id_for_user(auth.uid());
