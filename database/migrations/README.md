# Migrações do banco

## Módulo de obras

O arquivo `001_obras.sql` cria o modelo relacional do módulo de obras sem remover
as tabelas ou os registros existentes.

Para ativar o módulo no banco Supabase:

1. Abra o projeto no Supabase.
2. Entre em **SQL Editor** e crie uma nova consulta.
3. Copie todo o conteúdo de `001_obras.sql`.
4. Execute a consulta uma única vez.
5. Acesse `d-obras.html` com um usuário administrador e cadastre a primeira obra.
6. Use **Gerenciar vínculos** para associar operadores e máquinas.

Depois da migração, novos apontamentos exigem uma obra e alimentam automaticamente
as horas, o progresso, o custo de combustível e o custo de mão de obra. O custo de
mão de obra depende do campo `usuarios.custo_hora`, criado inicialmente com valor zero.

Os apontamentos antigos ficam com `registros.obra_id` nulo. Eles podem ser associados
posteriormente à obra correta por uma migração de dados específica.
