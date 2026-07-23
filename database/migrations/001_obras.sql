BEGIN;

-- Cadastros auxiliares do modelo operacional.
CREATE TABLE IF NOT EXISTS funcoes (
    id SERIAL PRIMARY KEY,
    classe VARCHAR(80) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes_usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO classes_usuario (nome, descricao) VALUES
    ('Lider operacional', 'Responsavel pela lideranca da operacao'),
    ('Operador', 'Profissional que opera maquinas e executa servicos'),
    ('Gestor operacional', 'Responsavel pela gestao operacional')
ON CONFLICT (nome) DO NOTHING;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS classe_id INTEGER REFERENCES classes_usuario(id);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_admissao DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS custo_hora NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS usuario_funcoes (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    funcao_id INTEGER NOT NULL REFERENCES funcoes(id) ON DELETE RESTRICT,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, funcao_id)
);

-- A obra e a entidade central do modulo.
CREATE TABLE IF NOT EXISTS obras (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(160) NOT NULL,
    cliente VARCHAR(160),
    descricao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'planejada'
        CHECK (status IN ('planejada', 'ativa', 'pausada', 'finalizada', 'cancelada')),
    data_inicio DATE,
    prazo DATE,
    data_conclusao DATE,
    endereco VARCHAR(255),
    cidade VARCHAR(120),
    estado CHAR(2),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    meta_horas NUMERIC(12,2) NOT NULL DEFAULT 0,
    orcamento NUMERIC(14,2) NOT NULL DEFAULT 0,
    criado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS obra_operadores (
    obra_id INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    funcao_id INTEGER REFERENCES funcoes(id) ON DELETE SET NULL,
    data_vinculo DATE NOT NULL DEFAULT CURRENT_DATE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (obra_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS obra_maquinas (
    obra_id INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    maquina_id INTEGER NOT NULL REFERENCES maquinas(id) ON DELETE RESTRICT,
    data_vinculo DATE NOT NULL DEFAULT CURRENT_DATE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (obra_id, maquina_id)
);

-- Cada apontamento passa a pertencer a uma obra. Registros antigos permanecem validos.
ALTER TABLE registros ADD COLUMN IF NOT EXISTS obra_id INTEGER REFERENCES obras(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_obras_status ON obras(status);
CREATE INDEX IF NOT EXISTS idx_registros_obra_data ON registros(obra_id, data);
CREATE INDEX IF NOT EXISTS idx_obra_operadores_usuario ON obra_operadores(usuario_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_obra_maquinas_maquina ON obra_maquinas(maquina_id) WHERE ativo = TRUE;

COMMIT;
