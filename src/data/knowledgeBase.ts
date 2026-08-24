import { KnowledgeConcept, SubjectId } from '../types';

/**
 * Validated Educational Knowledge Base
 * Architecture: Knowledge Base -> Question Templates -> Question Generator -> Validator -> Session
 * 
 * Each concept encapsulates facts, definitions, common mistakes, difficulty variants,
 * and parameterized question templates to guarantee high reliability without hallucinations.
 */
export const KNOWLEDGE_BASE_CONCEPTS: KnowledgeConcept[] = [
  // =========================================================================
  // BIOLOGIA
  // =========================================================================
  {
    id: 'bio_mitocondria',
    subjectId: 'biologia',
    topicId: 'bio_citologia',
    name: 'Mitocôndria e Respiração Celular',
    fact: 'A mitocôndria é a organela celular responsável pela produção da maior parte do ATP (energia) via respiração aeróbia.',
    definition: 'Organela celular delimitada por dupla membrana (cristas internas) que realiza o ciclo de Krebs e a fosforilação oxidativa.',
    relationships: ['ATP', 'Respiração Celular', 'Fosforilação Oxidativa', 'Ciclo de Krebs', 'Glicólise', 'Cristas Mitocondriais', 'Célula Muscular'],
    examples: ['Células musculares esqueléticas e cardíacas com alto consumo de energia possuem elevada densidade de mitocôndrias.'],
    counterExamples: ['Hemácias humanas maduras não possuem mitocôndrias e realizam apenas glicólise anaeróbia.'],
    commonMistakes: ['Confundir respiração celular aeróbia (mitocôndria) com fotossíntese (cloroplasto) ou fermentação lática (citosol).'],
    difficultyVariants: {
      easy: { promptAngle: 'Função direta e organela produtora de ATP', difficulty: 15 },
      medium: { promptAngle: 'Aplicação fisiológica em tecidos de alta demanda energética', difficulty: 35 },
      hard: { promptAngle: 'Relação entre membrana interna/cristas e cadeia transportadora de elétrons', difficulty: 65 },
      extreme: { promptAngle: 'Teoria da endossimbiose e herança do DNA mitocondrial materno', difficulty: 88 },
    },
    questionTemplates: [
      {
        id: 'bio_mito_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Qual organela citoplasmática está diretamente associada à síntese de ATP pela respiração celular aeróbia?',
        correctTemplate: 'Mitocôndria',
        distractorTemplates: ['Complexo Golgiense', 'Lisossomo', 'Retículo Endoplasmático Liso', 'Ribossomo'],
        explanationTemplate: 'A mitocôndria é a organela especializada na quebra oxidativa da glicose para formação de ATP através do Ciclo de Krebs e da Cadeia Respiratória.',
        baseDifficulty: 15,
        tags: ['citologia', 'bioenergetica', 'mitocondria', 'fatec', 'enem'],
      },
      {
        id: 'bio_mito_tpl_2',
        templateType: 'multiple_choice',
        promptTemplate: 'Em células musculares que realizam trabalho contrátil intenso e contínuo, observa-se alta densidade de qual estrutura celular para suprir a demanda de energia?',
        correctTemplate: 'Mitocôndrias',
        distractorTemplates: ['Peroxissomos', 'Centríolos', 'Cloroplastos', 'Vacúolos digestivos'],
        explanationTemplate: 'A contração muscular consome grandes volumes de ATP, exigindo um número expressivo de mitocôndrias para gerar energia rapidamente.',
        baseDifficulty: 30,
        tags: ['citologia', 'fisiologia', 'musculos', 'fatec', 'enem'],
      },
      {
        id: 'bio_mito_tpl_3',
        templateType: 'multiple_choice',
        promptTemplate: 'A teoria da endossimbiose sequencial propõe que as mitocôndrias se originaram de bactérias primitivas aeróbias fagocitadas por células hospedeiras. Uma evidência que comprova essa teoria é:',
        correctTemplate: 'Presença de DNA circular próprio, ribossomos 70S e capacidade de autoduplicação',
        distractorTemplates: [
          'Ausência de membrana plasmática delimitante',
          'Capacidade exclusiva de sintetizar lipídios para a membrana celular',
          'Dependência total do núcleo para qualquer tradução proteica',
          'Origem a partir da invaginação do retículo endoplasmático rugoso'
        ],
        explanationTemplate: 'Mitocôndrias e cloroplastos guardam vestígios procarióticos marcantes: material genético próprio circular, ribossomos 70S e reprodução independente por fissão binária.',
        baseDifficulty: 70,
        tags: ['evolucao', 'citologia', 'endossimbiose', 'fuvest', 'unicamp'],
      }
    ]
  },
  {
    id: 'bio_genetica_mendel',
    subjectId: 'biologia',
    topicId: 'bio_genetica',
    name: 'Genética Mendeliana (Primeira Lei)',
    fact: 'A Primeira Lei de Mendel (Lei da Segregação dos Fatores) estabelece que cada caráter é determinado por um par de alelos que se separam na formação dos gametas.',
    definition: 'Princípio genético fundamental em que indivíduos diploides heterozigotos (Aa) produzem 50% de gametas com alelo A e 50% com alelo a.',
    relationships: ['Dominância Completa', 'Recessividade', 'Cruzamento Teste', 'Quadro de Punnett', 'Gametas', 'Meiose'],
    examples: ['Cruzamento entre dois heterozigotos Aa × Aa resulta na proporção fenotípica 3:1 (75% dominantes, 25% recessivos) e genotípica 1:2:1 (1/4 AA, 2/4 Aa, 1/4 aa).'],
    counterExamples: ['Codominância e dominância incompleta geram fenótipos intermediários (proporção fenotípica 1:2:1).'],
    commonMistakes: ['Confundir proporção genotípica (1:2:1) com proporção fenotípica (3:1) no caso de dominância simples.'],
    difficultyVariants: {
      easy: { promptAngle: 'Conceito de alelos dominantes e recessivos', difficulty: 18 },
      medium: { promptAngle: 'Cálculo de probabilidade em cruzamento monohíbrido Aa × Aa', difficulty: 40 },
      hard: { promptAngle: 'Heredograma com genealogia e cálculo de probabilidade condicionada', difficulty: 72 },
    },
    questionTemplates: [
      {
        id: 'bio_gen_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'No cruzamento de dois indivíduos heterozigotos para um gene autossômico com dominância completa (Aa × Aa), qual é a probabilidade esperada de nascimento de um descendente com fenótipo recessivo?',
        correctTemplate: '25% (1/4)',
        distractorTemplates: ['50% (1/2)', '75% (3/4)', '100% (4/4)', '12,5% (1/8)'],
        explanationTemplate: 'O cruzamento Aa × Aa gera 1/4 AA, 2/4 Aa e 1/4 aa. Como apenas o genótipo "aa" expressa o fenótipo recessivo, a probabilidade é de 1/4 (25%).',
        baseDifficulty: 25,
        tags: ['genetica', 'mendel', 'probabilidade', 'fatec', 'enem'],
      },
      {
        id: 'bio_gen_tpl_2',
        templateType: 'multiple_choice',
        promptTemplate: 'Um casal fenotipicamente normal para uma anomalia genética recessiva teve um primeiro filho afetado. Qual é a probabilidade de o próximo filho desse casal ser também afetado?',
        correctTemplate: '1/4 (25%)',
        distractorTemplates: ['1/2 (50%)', '3/4 (75%)', '0% (impossível)', '1/16 (6,25%)'],
        explanationTemplate: 'Para pais normais gerarem um filho afetado (aa), ambos devem ser heterozigotos (Aa). Cada gestação subsequente tem probabilidade independente de 1/4 para o genótipo aa.',
        baseDifficulty: 45,
        tags: ['genetica', 'heredograma', 'probabilidade', 'enem', 'fuvest'],
      }
    ]
  },
  {
    id: 'bio_fotossintese',
    subjectId: 'biologia',
    topicId: 'bio_botanica',
    name: 'Fotossíntese e Cloroplastos',
    fact: 'A fotossíntese converte energia luminosa, água e gás carbônico (CO2) em glicose e oxigênio (O2) nos cloroplastos.',
    definition: 'Processo anabólico autotrófico dividido em fase clara (fotoquímica nos tilacoides) e fase escura (enzimática/Ciclo de Calvin no estroma).',
    relationships: ['Clorofila', 'Fase Clara', 'Ciclo de Calvin', 'Tilacoide', 'Estroma', 'Fotólise da Água'],
    examples: ['O oxigênio liberado na atmosfera pelos vegetais provém exclusivamente da fotólise da molécula de água, não do CO2.'],
    counterExamples: ['Bactérias quimiossintetizantes produzem compostos orgânicos sem usar luz solar.'],
    commonMistakes: ['Achar que o oxigênio liberado na fotossíntese vem do CO2; ele provém da quebra da água (H2O).'],
    difficultyVariants: {
      easy: { promptAngle: 'Reagentes e produtos gerais da fotossíntese', difficulty: 15 },
      medium: { promptAngle: 'Origem do gás oxigênio e localização das etapas no cloroplasto', difficulty: 42 },
      hard: { promptAngle: 'Fatores limitantes: intensidade luminosa, concentração de CO2 e temperatura', difficulty: 68 },
    },
    questionTemplates: [
      {
        id: 'bio_foto_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Durante a etapa fotoquímica (fase clara) da fotossíntese nas plantas, o gás oxigênio (O2) liberado para a atmosfera provém diretamente da:',
        correctTemplate: 'Fotólise da molécula de água (H2O)',
        distractorTemplates: [
          'Redução do gás carbônico (CO2)',
          'Quebra da molécula de glicose no citoplasma',
          'Ativação do ATP no estroma',
          'Degradação enzimática do amido'
        ],
        explanationTemplate: 'Experimentos com isótopos comprovam que o oxigênio liberado na fotossíntese tem origem na quebra da água (fotólise da água / reação de Hill) nos tilacoides.',
        baseDifficulty: 38,
        tags: ['botanica', 'fotossintese', 'bioenergetica', 'fatec', 'enem'],
      }
    ]
  },

  // =========================================================================
  // FÍSICA
  // =========================================================================
  {
    id: 'fis_mruv_cinematica',
    subjectId: 'fisica',
    topicId: 'fis_cinematica',
    name: 'Movimento Retilíneo Uniformemente Variado (MRUV)',
    fact: 'No MRUV, a aceleração escalar é constante e não nula, fazendo a velocidade variar linearmente com o tempo.',
    definition: 'Equações fundamentais: v = v₀ + a·t, s = s₀ + v₀·t + (a·t²)/2 e Equação de Torricelli: v² = v₀² + 2·a·Δs.',
    relationships: ['Velocidade Inicial (v₀)', 'Aceleração (a)', 'Deslocamento (Δs)', 'Equação de Torricelli', 'Queda Livre'],
    examples: ['Um carro partindo do repouso (v₀ = 0) com aceleração a = 2 m/s² percorre 100 m ao atingir v = 20 m/s.'],
    counterExamples: ['No Movimento Uniforme (MU), a aceleração é rigorosamente nula e a velocidade é constante.'],
    commonMistakes: ['Tentar usar v = Δs/Δt quando há aceleração; em MRUV deve-se usar as funções horárias ou Torricelli.'],
    difficultyVariants: {
      easy: { promptAngle: 'Cálculo direto de velocidade final com aceleração constante', difficulty: 15 },
      medium: { promptAngle: 'Uso da equação de Torricelli sem dado de tempo', difficulty: 45 },
      hard: { promptAngle: 'Encontro de móveis com gráficos v × t e s × t integrados', difficulty: 75 },
    },
    questionTemplates: [
      {
        id: 'fis_mruv_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Um veículo parte do repouso com aceleração constante de 3 m/s². Qual será sua velocidade escalar após 6 segundos?',
        correctTemplate: '18 m/s',
        distractorTemplates: ['9 m/s', '12 m/s', '24 m/s', '54 m/s'],
        explanationTemplate: 'Aplicando a função horária da velocidade: v = v₀ + a·t = 0 + 3 · 6 = 18 m/s.',
        baseDifficulty: 20,
        tags: ['cinematica', 'mruv', 'velocidade', 'fatec', 'enem'],
      },
      {
        id: 'fis_mruv_tpl_2',
        templateType: 'multiple_choice',
        promptTemplate: 'Um móvel partindo do repouso é acelerado uniformemente a 4 m/s² ao longo de uma pista reta de 50 metros. Qual é a velocidade ao final do percurso?',
        correctTemplate: '20 m/s',
        distractorTemplates: ['10 m/s', '25 m/s', '40 m/s', '200 m/s'],
        explanationTemplate: 'Como não temos o tempo, usamos Torricelli: v² = v₀² + 2·a·Δs = 0² + 2·4·50 = 400 => v = √400 = 20 m/s.',
        baseDifficulty: 42,
        tags: ['cinematica', 'torricelli', 'mruv', 'fatec', 'enem'],
      }
    ]
  },
  {
    id: 'fis_leis_newton',
    subjectId: 'fisica',
    topicId: 'fis_dinamica',
    name: 'Leis de Newton e Força Resultante',
    fact: 'A Segunda Lei de Newton (Princípio Fundamental da Dinâmica) estabelece que a força resultante é o produto da massa pela aceleração (F_res = m · a).',
    definition: '1ª Lei: Inércia; 2ª Lei: F = m·a; 3ª Lei: Ação e Reação (forças iguais em módulo, mesma direção, sentidos opostos e aplicadas em corpos diferentes).',
    relationships: ['Inércia', 'Força Peso (P = m·g)', 'Força Normal', 'Força de Atrito (Fat = μ·N)', 'Ação e Reação'],
    examples: ['Ao empurrar um bloco de 10 kg com força resultante de 30 N, ele adquire aceleração de 3 m/s².'],
    counterExamples: ['Forças de ação e reação NUNCA se equilibram nem se anulam porque atuam em corpos distintos.'],
    commonMistakes: ['Dizer que o par ação-reação se anula no mesmo objeto.'],
    difficultyVariants: {
      easy: { promptAngle: 'Identificação das três leis de Newton', difficulty: 15 },
      medium: { promptAngle: 'Cálculo de força resultante com atrito em superfície plana', difficulty: 45 },
      hard: { promptAngle: 'Plano inclinado e sistemas de blocos conectados por fio ideal', difficulty: 70 },
    },
    questionTemplates: [
      {
        id: 'fis_newton_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Sobre o par de forças de Ação e Reação (Terceira Lei de Newton), é correto afirmar que:',
        correctTemplate: 'Atuam sempre em corpos diferentes e, portanto, nunca se anulam mutuamente',
        distractorTemplates: [
          'Atuam no mesmo corpo com sentidos opostos, anulando o movimento',
          'A força de reação só surge após um intervalo de tempo da ação',
          'O módulo da reação depende da massa de apenas um dos corpos',
          'Surgem exclusivamente em corpos que se encontram em repouso'
        ],
        explanationTemplate: 'A 3ª Lei de Newton define forças de interação mútua: têm mesmo módulo e direção, sentidos contrários e atuam em corpos distintos, não podendo se anular.',
        baseDifficulty: 30,
        tags: ['dinamica', 'newton', 'acao_reacao', 'fatec', 'enem'],
      }
    ]
  },

  // =========================================================================
  // QUÍMICA
  // =========================================================================
  {
    id: 'qui_estequiometria',
    subjectId: 'quimica',
    topicId: 'qui_estequiometria',
    name: 'Cálculo Estequiométrico e Leis Ponderais',
    fact: 'As reações químicas obedecem à Lei de Lavoisier (conservação das massas) e à Lei de Proust (proporções constantes).',
    definition: 'Relação quantitativa em mols, massa, volume molar (22,4 L nas CNTP) e moléculas (6,02 × 10²³) entre reagentes e produtos.',
    relationships: ['Número de Mols (n = m/M)', 'Massa Molar (g/mol)', 'Volume Molar (22,4 L)', 'Reagente Limitante', 'Rendimento'],
    examples: ['2 H2 + O2 -> 2 H2O. Para queimar 4 g de H2 (2 mols), são necessários 32 g de O2 (1 mol), formando 36 g de H2O.'],
    counterExamples: ['Misturas com reagente em excesso não consom 100% de todos os reagentes.'],
    commonMistakes: ['Fazer contas estequiométricas sem antes balancear corretamente os coeficientes da equação química.'],
    difficultyVariants: {
      easy: { promptAngle: 'Conservação de massas de Lavoisier', difficulty: 15 },
      medium: { promptAngle: 'Conversão entre massa e mols com proporção estequiométrica', difficulty: 45 },
      hard: { promptAngle: 'Reações com reagente limitante e grau de pureza/rendimento', difficulty: 72 },
    },
    questionTemplates: [
      {
        id: 'qui_esteq_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Qual é o primeiro passo obrigatório e indispensável antes de realizar qualquer cálculo estequiométrico com uma equação química?',
        correctTemplate: 'Balancear a equação química para garantir a conservação do número de átomos',
        distractorTemplates: [
          'Calcular a constante dos gases ideais (R)',
          'Medir a temperatura ambiente em Kelvin',
          'Determinar o pH final da solução',
          'Dividir a massa de todos os reagentes por 22,4 L'
        ],
        explanationTemplate: 'O balanceamento acerta os coeficientes estequiométricos que indicam a proporção em mols de reagentes e produtos respeitando Lavoisier.',
        baseDifficulty: 18,
        tags: ['estequiometria', 'balanceamento', 'lavoisier', 'fatec', 'enem'],
      }
    ]
  },

  // =========================================================================
  // HISTÓRIA
  // =========================================================================
  {
    id: 'his_revolucao_francesa',
    subjectId: 'historia',
    topicId: 'his_geral',
    name: 'Revolução Francesa (1789–1799)',
    fact: 'A Revolução Francesa derrubou o Antigo Regime absolutista e os privilégios estamentais do clero e da nobreza.',
    definition: 'Processo revolucionário burguês marcado pela Queda da Bastilha (1789), Declaração dos Direitos do Homem e do Cidadão, Fase Jacobina (Terror) e Diretório.',
    relationships: ['Queda da Bastilha', 'Iluminismo', 'Girondinos vs Jacobinos', 'Declaração dos Direitos', 'Robespierre', 'Napoleão Bonaparte'],
    examples: ['A tomada da fortaleza da Bastilha em 14 de julho de 1789 tornou-se o símbolo da queda do absolutismo real.'],
    counterExamples: ['A Revolução Francesa não instaurou imediatamente um regime socialista; foi uma revolução de caráter essencialmente burguês.'],
    commonMistakes: ['Confundir a fase moderada dos girondinos com a fase radical/terror liderada pelos jacobinos sob Robespierre.'],
    difficultyVariants: {
      easy: { promptAngle: 'Causas socioeconômicas e a divisão em três estados', difficulty: 15 },
      medium: { promptAngle: 'Significado da Declaração dos Direitos do Homem e do Cidadão', difficulty: 38 },
      hard: { promptAngle: 'Contradições da Convenção Jacobina e o Golpe do 18 de Brumário', difficulty: 68 },
    },
    questionTemplates: [
      {
        id: 'his_rev_fr_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Na França pré-revolucionária do século XVIII, qual segmento social sustentava a maior parte da carga tributária sem possuir privilégios políticos?',
        correctTemplate: 'O Terceiro Estado (composto por burguesia, camponeses e trabalhadores urbanos)',
        distractorTemplates: [
          'O Primeiro Estado (alto e baixo clero católico)',
          'O Segundo Estado (nobreza cortesã, togada e provincial)',
          'Apenas a Guarda Real absolutista',
          'Exclusivamente a nobreza feudal do interior'
        ],
        explanationTemplate: 'O Terceiro Estado representava cerca de 98% da população francesa e sustentava financeiramente o clero (1º Estado) e a nobreza (2º Estado), que eram isentos de impostos.',
        baseDifficulty: 20,
        tags: ['historia_geral', 'revolucao_francesa', 'antigo_regime', 'fatec', 'enem'],
      }
    ]
  },
  {
    id: 'his_era_vargas',
    subjectId: 'historia',
    topicId: 'his_brasil',
    name: 'Era Vargas (1930–1945)',
    fact: 'Getúlio Vargas assumiu o poder na Revolução de 1930, encerrando a República Velha e promovendo a industrialização e as leis trabalhistas (CLT).',
    definition: 'Período dividido em três fases: Governo Provisório (1930-1934), Governo Constitucional (1934-1937) e Estado Novo (ditadura centralizadora de 1937 a 1945).',
    relationships: ['Revolução Constitucionalista de 1932', 'Estado Novo', 'CLT', 'DIP (Propaganda)', 'CSN (Siderúrgica Nacional)', 'Populismo'],
    examples: ['Criação da CLT (1943), da Companhia Siderúrgica Nacional (CSN) e da Vale do Rio Doce.'],
    counterExamples: ['O Estado Novo não foi uma democracia liberal; foi uma ditadura de inspiração nazi-fascista (polaca).'],
    commonMistakes: ['Achar que Vargas governou democraticamente durante todo o período de 1930 a 1945.'],
    difficultyVariants: {
      easy: { promptAngle: 'Consolidação das leis trabalhistas (CLT) e industrialização de base', difficulty: 15 },
      medium: { promptAngle: 'A Revolução de 1932 e a Constituição de 1934 (voto feminino)', difficulty: 42 },
      hard: { promptAngle: 'A ambiguidade da política externa de Vargas e a entrada do Brasil na 2ª Guerra Mundial', difficulty: 70 },
    },
    questionTemplates: [
      {
        id: 'his_vargas_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Qual foi uma das principais marcas econômicas e sociais do governo de Getúlio Vargas durante a década de 1930 e 1940 no Brasil?',
        correctTemplate: 'Investimento estatal em indústrias de base (como a CSN) e a criação da Consolidação das Leis do Trabalho (CLT)',
        distractorTemplates: [
          'Adoção do livre mercado irrestrito e privatização de estatais de petróleo',
          'Aliança exclusiva com o café paulista sem nenhuma política fabril',
          'Extinção de sindicatos sem concessão de direitos laborais',
          'Abertura total para importação maciça de manufaturados ingleses'
        ],
        explanationTemplate: 'Vargas adotou o nacional-desenvolvimentismo com intervenção estatal na infraestrutura e promoveu a legislação trabalhista para atrelar a classe trabalhadora ao Estado.',
        baseDifficulty: 25,
        tags: ['historia_brasil', 'era_vargas', 'industrializacao', 'clt', 'fatec', 'enem'],
      }
    ]
  },

  // =========================================================================
  // PORTUGUÊS
  // =========================================================================
  {
    id: 'por_crase',
    subjectId: 'portugues',
    topicId: 'por_gramatica',
    name: 'Emprego do Acento Indicativo de Crase',
    fact: 'A crase é a fusão da preposição "a" com o artigo definido feminino "a/as" ou pronomes demonstrativos iniciados por "a" (àquele, àquela, àquilo).',
    definition: 'Regra geral de teste: troca-se o termo feminino por um masculino correspondente. Se resultar em "ao", há crase.',
    relationships: ['Preposição A', 'Artigo Feminino A', 'Regência Verbal e Nominal', 'Pronomes Demonstrativos', 'Locuções Femininas'],
    examples: ['Vou à praia (Vou ao clube => há crase); Chegamos à noite (locução adverbial feminina).'],
    counterExamples: ['Nunca ocorre crase antes de palavras masculinas (Andar a pé), verbos (Começou a chover) ou pronomes pessoais (Disse a ela).'],
    commonMistakes: ['Colocar crase antes de palavras masculinas ("pagamento à prazo" está ERRADO; o correto é "a prazo").'],
    difficultyVariants: {
      easy: { promptAngle: 'Casos proibidos: antes de verbo e palavra masculina', difficulty: 15 },
      medium: { promptAngle: 'Troca pelo masculino e locuções prepositivas/adverbiais femininas', difficulty: 35 },
      hard: { promptAngle: 'Casos facultativos (nomes próprios femininos, até a, pronome possessivo feminino)', difficulty: 65 },
    },
    questionTemplates: [
      {
        id: 'por_crase_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Em qual das frases abaixo o uso do acento indicativo de crase é OBRIGATÓRIO de acordo com a norma-padrão?',
        correctTemplate: 'Os alunos compareceram à reunião de orientação vestibular.',
        distractorTemplates: [
          'Todos os produtos da loja foram comprados à prazo.',
          'Ele começou à estudar com bastante antecedência.',
          'Entregamos o documento à ele no início da tarde.',
          'O motorista dirigia à toda velocidade pela rodovia.'
        ],
        explanationTemplate: 'Comparecer exige a preposição "a", e "reunião" aceita o artigo feminino "a" (Compareceram ao encontro). Antes de palavra masculina (prazo), verbo (estudar) e pronome pessoal (ele) é proibida a crase.',
        baseDifficulty: 28,
        tags: ['gramatica', 'crase', 'regencia', 'fatec', 'enem', 'fuvest'],
      },
      {
        id: 'por_crase_tpl_2',
        templateType: 'multiple_choice',
        promptTemplate: 'Assinale a alternativa que justifica corretamente por que a expressão "andar a cavalo" NÃO recebe acento indicativo de crase:',
        correctTemplate: 'Porque "cavalo" é um substantivo masculino e não admite o artigo feminino "a"',
        distractorTemplates: [
          'Porque se trata de um verbo no particípio passado',
          'Porque a preposição "a" é opcional após o verbo andar',
          'Porque é uma locução adverbial de modo obrigatória',
          'Porque a palavra cavalo está no plural implícito'
        ],
        explanationTemplate: 'A regra básica veda a crase antes de palavras masculinas, pois não há o artigo feminino "a" para fundir com a preposição.',
        baseDifficulty: 18,
        tags: ['gramatica', 'crase', 'fatec', 'enem'],
      }
    ]
  },

  // =========================================================================
  // MATEMÁTICA TEÓRICA / VESTIBULAR
  // =========================================================================
  {
    id: 'mat_porcentagem_juros',
    subjectId: 'matematica',
    topicId: 'mat_porcentagem',
    name: 'Porcentagem e Aumentos Sucessivos',
    fact: 'Aumentar um valor em i% equivale a multiplicá-lo pelo fator (1 + i/100). Aumentos percentuais sucessivos multiplicam seus respectivos fatores.',
    definition: 'Fator multiplicativo: Aumento de 20% = × 1,20; Desconto de 15% = × 0,85. Dois aumentos sucessivos de 20% resultam em 1,20 × 1,20 = 1,44 (aumento real de 44%, não 40%).',
    relationships: ['Fator de Aumento', 'Fator de Redução', 'Juros Compostos', 'Variação Percentual', 'Descontos Sucessivos'],
    examples: ['R$ 100 com aumento de 10% vai para R$ 110; com mais 10%, vai para R$ 121 (aumento total de 21%).'],
    counterExamples: ['Somar as porcentagens diretamente (20% + 20% = 40%) é um erro conceitual grave em aumentos sucessivos.'],
    commonMistakes: ['Achar que um aumento de 20% seguido de um desconto de 20% faz o valor voltar ao preço original (1,20 × 0,80 = 0,96, ou seja, perda de 4%).'],
    difficultyVariants: {
      easy: { promptAngle: 'Cálculo de porcentagem simples de um valor', difficulty: 12 },
      medium: { promptAngle: 'Aumentos e descontos sucessivos com fator multiplicativo', difficulty: 40 },
      hard: { promptAngle: 'Equações financeiras e valor nominal com inflação composta', difficulty: 70 },
    },
    questionTemplates: [
      {
        id: 'mat_porc_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Um produto custava R$ 200,00 e sofreu dois aumentos sucessivos de 10% e 20%, respectivamente. Qual é o valor final do produto?',
        correctTemplate: 'R$ 264,00',
        distractorTemplates: ['R$ 260,00', 'R$ 250,00', 'R$ 270,00', 'R$ 230,00'],
        explanationTemplate: 'Aplicando os fatores: 200 × (1 + 0,10) × (1 + 0,20) = 200 × 1,10 × 1,20 = 220 × 1,20 = R$ 264,00.',
        baseDifficulty: 35,
        tags: ['matematica', 'porcentagem', 'aumento_sucessivo', 'fatec', 'enem'],
      },
      {
        id: 'mat_porc_tpl_2',
        templateType: 'multiple_choice',
        promptTemplate: 'Uma mercadoria sofre um aumento de 25% e, no mês seguinte, um desconto de 20% sobre o novo preço. Em relação ao preço original, a mercadoria:',
        correctTemplate: 'Permaneceu com o mesmo preço original',
        distractorTemplates: [
          'Aumentou 5%',
          'Diminuiu 5%',
          'Aumentou 2,5%',
          'Diminuiu 2,5%'
        ],
        explanationTemplate: 'Fator resultante: (1 + 0,25) × (1 - 0,20) = 1,25 × 0,80 = 1,00. Multiplicar por 1,00 significa que não houve variação (0% de alteração).',
        baseDifficulty: 45,
        tags: ['matematica', 'porcentagem', 'pegadinha', 'fatec', 'enem'],
      }
    ]
  },
  {
    id: 'mat_trigonometria',
    subjectId: 'matematica',
    topicId: 'mat_trigonometria',
    name: 'Razões Trigonométricas no Triângulo Retângulo',
    fact: 'No triângulo retângulo, seno = cateto oposto / hipotenusa, cosseno = cateto adjacente / hipotenusa e tangente = cateto oposto / cateto adjacente.',
    definition: 'Relação fundamental da trigonometria: sen²(θ) + cos²(θ) = 1. Ângulos notáveis: 30°, 45° e 60°.',
    relationships: ['Seno', 'Cosseno', 'Tangente', 'Teorema de Pitágoras', 'Ângulos Notáveis (30°, 45°, 60°)', 'Ciclo Trigonométrico'],
    examples: ['sen(30°) = 1/2, cos(30°) = √3/2, tg(45°) = 1.'],
    counterExamples: ['A tangente de 90° não é definida nos números reais.'],
    commonMistakes: ['Inverter cateto oposto e cateto adjacente ao mudar o ângulo de referência do triângulo.'],
    difficultyVariants: {
      easy: { promptAngle: 'Valores dos ângulos notáveis (sen, cos, tg)', difficulty: 15 },
      medium: { promptAngle: 'Cálculo de altura ou distância inacessível com triângulo retângulo', difficulty: 40 },
      hard: { promptAngle: 'Identidades trigonométricas e redução ao primeiro quadrante', difficulty: 75 },
    },
    questionTemplates: [
      {
        id: 'mat_trig_tpl_1',
        templateType: 'multiple_choice',
        promptTemplate: 'Uma rampa plana de 10 metros de comprimento forma um ângulo de 30° com o solo horizontal. Qual é a altura vertical atingida ao final da rampa? (Dado: sen(30°) = 0,5; cos(30°) = 0,87)',
        correctTemplate: '5 metros',
        distractorTemplates: ['8,7 metros', '10 metros', '2,5 metros', '6 metros'],
        explanationTemplate: 'A altura é o cateto oposto à inclinação: sen(30°) = Altura / Hipotenusa => 0,5 = Altura / 10 => Altura = 5 m.',
        baseDifficulty: 25,
        tags: ['matematica', 'trigonometria', 'angulos_notaveis', 'fatec', 'enem'],
      }
    ]
  }
];

/**
 * Helper to get a KnowledgeConcept by topicId or id
 */
export function getKnowledgeConcept(conceptIdOrTopicId: string): KnowledgeConcept | undefined {
  return KNOWLEDGE_BASE_CONCEPTS.find(
    (c) => c.id === conceptIdOrTopicId || c.topicId === conceptIdOrTopicId
  );
}

/**
 * Helper to get all concepts for a given subject
 */
export function getKnowledgeConceptsBySubject(subjectId: SubjectId): KnowledgeConcept[] {
  return KNOWLEDGE_BASE_CONCEPTS.filter((c) => c.subjectId === subjectId);
}
