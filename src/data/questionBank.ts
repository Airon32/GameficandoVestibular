import {
  EducationalQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  MatchingQuestion,
  OrderingQuestion,
  FlashcardQuestion,
  FillBlankQuestion,
  SubjectId,
} from '../types';

export const QUESTION_BANK: EducationalQuestion[] = [
  // ==========================================
  // MATEMÁTICA
  // ==========================================
  {
    id: 'mat_001',
    subjectId: 'matematica',
    topicId: 'porcentagem',
    difficulty: 35,
    questionType: 'multiple_choice',
    prompt: 'Um produto que custava R$ 250,00 sofreu um aumento de 20% e, em seguida, um desconto de 10% sobre o novo valor. Qual é o preço final do produto?',
    options: [
      { id: 'A', text: 'R$ 260,00' },
      { id: 'B', text: 'R$ 270,00' },
      { id: 'C', text: 'R$ 275,00' },
      { id: 'D', text: 'R$ 280,00' },
      { id: 'E', text: 'R$ 265,00' },
    ],
    correctOptionId: 'B',
    explanation: 'Após 20% de aumento: 250 * 1,20 = R$ 300,00. Após 10% de desconto sobre 300: 300 * 0,90 = R$ 270,00.',
    keyConcept: 'Aumentos e descontos sucessivos',
    source: 'FATEC 2023',
    tags: ['porcentagem', 'matemática comercial'],
    examProfiles: ['FATEC', 'ENEM', 'UNESP'],
  },
  {
    id: 'mat_002',
    subjectId: 'matematica',
    topicId: 'funcoes',
    difficulty: 55,
    questionType: 'multiple_choice',
    prompt: 'Seja a função quadrática f(x) = -x² + 6x - 5. O valor máximo assumido por f(x) e a coordenada x do vértice são, respectivamente:',
    options: [
      { id: 'A', text: 'Y_v = 4 e X_v = 3' },
      { id: 'B', text: 'Y_v = 3 e X_v = 4' },
      { id: 'C', text: 'Y_v = 5 e X_v = 3' },
      { id: 'D', text: 'Y_v = 9 e X_v = 3' },
      { id: 'E', text: 'Y_v = 4 e X_v = -3' },
    ],
    correctOptionId: 'A',
    explanation: 'X_v = -b / (2a) = -6 / (2 * (-1)) = 3. Y_v = f(3) = -(3)² + 6(3) - 5 = -9 + 18 - 5 = 4.',
    keyConcept: 'Vértice da Parábola e Máximo de Função',
    source: 'ENEM 2022',
    tags: ['função quadrática', 'álgebra'],
    examProfiles: ['ENEM', 'FUVEST', 'FATEC'],
  },
  {
    id: 'mat_003',
    subjectId: 'matematica',
    topicId: 'geometria_plana',
    difficulty: 45,
    questionType: 'true_false',
    prompt: 'Julgue a afirmação sobre geometria plana:',
    statement: 'Em qualquer triângulo retângulo, a mediana relativa à hipotenusa mede exatamente metade do comprimento da hipotenusa.',
    isTrue: true,
    explanation: 'Correto! O ponto médio da hipotenusa é o circuncentro do triângulo retângulo, equidistando dos três vértices.',
    keyConcept: 'Propriedades do Triângulo Retângulo',
    source: 'FUVEST',
    tags: ['geometria plana', 'triângulos'],
    examProfiles: ['FUVEST', 'UNICAMP'],
  },
  {
    id: 'mat_004',
    subjectId: 'matematica',
    topicId: 'trigonometria',
    difficulty: 65,
    questionType: 'multiple_choice',
    prompt: 'Qual é o valor exato de sen(150°) + cos(120°)?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '0' },
      { id: 'C', text: '√3 / 2' },
      { id: 'D', text: '-1/2' },
      { id: 'E', text: '1/2' },
    ],
    correctOptionId: 'B',
    explanation: 'sen(150°) = sen(180° - 30°) = sen(30°) = 1/2. cos(120°) = -cos(180° - 60°) = -cos(60°) = -1/2. Logo, 1/2 + (-1/2) = 0.',
    keyConcept: 'Redução ao Primeiro Quadrante',
    source: 'FUVEST 2021',
    tags: ['trigonometria', 'ciclo trigonométrico'],
    examProfiles: ['FUVEST', 'UNICAMP', 'ENEM'],
  },

  // ==========================================
  // FÍSICA
  // ==========================================
  {
    id: 'fis_001',
    subjectId: 'fisica',
    topicId: 'cinematica',
    difficulty: 30,
    questionType: 'multiple_choice',
    prompt: 'Um veículo parte do repouso e atinge a velocidade de 108 km/h em um intervalo de 10 segundos com aceleração escalar constante. Qual foi a distância percorrida pelo veículo nesse tempo?',
    options: [
      { id: 'A', text: '150 metros' },
      { id: 'B', text: '300 metros' },
      { id: 'C', text: '108 metros' },
      { id: 'D', text: '225 metros' },
      { id: 'E', text: '180 metros' },
    ],
    correctOptionId: 'A',
    explanation: '108 km/h = 108 / 3,6 = 30 m/s. Aceleração a = Δv/Δt = 30/10 = 3 m/s². Distância Δs = (a * t²) / 2 = (3 * 10²) / 2 = 300 / 2 = 150 m.',
    keyConcept: 'Movimento Retilíneo Uniformemente Variado (MRUV)',
    source: 'FATEC 2024',
    tags: ['cinemática', 'MRUV'],
    examProfiles: ['FATEC', 'ENEM', 'UNESP'],
  },
  {
    id: 'fis_002',
    subjectId: 'fisica',
    topicId: 'eletrodinamica',
    difficulty: 48,
    questionType: 'multiple_choice',
    prompt: 'Um chuveiro elétrico opera com potência de 4400 W quando conectado a uma rede de 220 V. Qual é a corrente elétrica que o percorre e o valor da sua resistência elétrica?',
    options: [
      { id: 'A', text: '20 A e 11 Ω' },
      { id: 'B', text: '10 A e 22 Ω' },
      { id: 'C', text: '20 A e 22 Ω' },
      { id: 'D', text: '15 A e 11 Ω' },
      { id: 'E', text: '25 A e 8,8 Ω' },
    ],
    correctOptionId: 'A',
    explanation: 'P = U * i => i = 4400 / 220 = 20 A. U = R * i => R = 220 / 20 = 11 Ω (ou R = U²/P = 48400 / 4400 = 11 Ω).',
    keyConcept: 'Primeira Lei de Ohm e Potência Elétrica',
    source: 'ENEM 2023',
    tags: ['eletrodinâmica', 'potência'],
    examProfiles: ['ENEM', 'FATEC', 'FUVEST'],
  },
  {
    id: 'fis_003',
    subjectId: 'fisica',
    topicId: 'termologia_calor',
    difficulty: 40,
    questionType: 'true_false',
    prompt: 'Julgue o conceito termodinâmico:',
    statement: 'O calor sempre flui espontaneamente de um corpo com maior quantidade de calor para um de menor quantidade de calor, independentemente da temperatura.',
    isTrue: false,
    explanation: 'Falso! O calor flui espontaneamente do corpo de MAIOR TEMPERATURA para o de menor temperatura, não dependendo da quantidade absoluta de calor armazenada.',
    keyConcept: 'Segunda Lei da Termodinâmica e Propagação de Calor',
    source: 'FUVEST',
    tags: ['calorimetria', 'termodinâmica'],
    examProfiles: ['FUVEST', 'ENEM'],
  },
  {
    id: 'fis_004',
    subjectId: 'fisica',
    topicId: 'ondulatoria',
    difficulty: 55,
    questionType: 'matching',
    prompt: 'Associe cada fenômeno ondulatório à sua respectiva definição física:',
    pairs: [
      { id: 'p1', left: 'Refração', right: 'Mudança de velocidade ao mudar de meio' },
      { id: 'p2', left: 'Difração', right: 'Capacidade de contornar obstáculos ou fendas' },
      { id: 'p3', left: 'Efeito Doppler', right: 'Variação aparente de frequência pelo movimento relativo' },
      { id: 'p4', left: 'Polarização', right: 'Seleção de uma única direção de vibração transversal' },
    ],
    explanation: 'A refração altera a velocidade; a difração contorna obstáculos; Doppler altera a frequência aparente; a polarização seleciona o plano de vibração (somente ondas transversais).',
    keyConcept: 'Fenômenos Ondulatórios',
    source: 'UNICAMP',
    tags: ['ondulatória', 'fenômenos'],
    examProfiles: ['UNICAMP', 'FUVEST', 'ENEM'],
  },

  // ==========================================
  // QUÍMICA
  // ==========================================
  {
    id: 'quim_001',
    subjectId: 'quimica',
    topicId: 'estequiometria',
    difficulty: 50,
    questionType: 'multiple_choice',
    prompt: 'Na combustão completa de 1 mol de gás propano (C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O), qual é o volume de gás carbônico (CO₂) produzido nas CNTP (onde 1 mol de gás ocupa 22,4 L)?',
    options: [
      { id: 'A', text: '22,4 L' },
      { id: 'B', text: '44,8 L' },
      { id: 'C', text: '67,2 L' },
      { id: 'D', text: '89,6 L' },
      { id: 'E', text: '112,0 L' },
    ],
    correctOptionId: 'C',
    explanation: 'Pela estequiometria, 1 mol de C₃H₈ produz 3 mols de CO₂. Nas CNTP: 3 * 22,4 L = 67,2 L de CO₂.',
    keyConcept: 'Cálculo Estequiométrico e Volume Molar',
    source: 'FATEC 2023',
    tags: ['estequiometria', 'gases'],
    examProfiles: ['FATEC', 'ENEM', 'UNESP'],
  },
  {
    id: 'quim_002',
    subjectId: 'quimica',
    topicId: 'quimica_organica',
    difficulty: 45,
    questionType: 'multiple_choice',
    prompt: 'A substância responsável pelo aroma característico de banana é o etanoato de isopentila. A qual função orgânica oxigenada pertence essa molécula?',
    options: [
      { id: 'A', text: 'Éter' },
      { id: 'B', text: 'Éster' },
      { id: 'C', text: 'Cetona' },
      { id: 'D', text: 'Aldeído' },
      { id: 'E', text: 'Ácido Carboxílico' },
    ],
    correctOptionId: 'B',
    explanation: 'Compostos com terminação "-oato de ...ila" possuem o grupo funcional -COO- (carbonila ligada a oxigênio e cadeias carbônicas), caracterizando os ÉSTERES, amplamente usados como flavorizantes.',
    keyConcept: 'Funções Orgânicas Oxigenadas',
    source: 'ENEM 2023',
    tags: ['química orgânica', 'funções'],
    examProfiles: ['ENEM', 'FATEC', 'FUVEST'],
  },
  {
    id: 'quim_003',
    subjectId: 'quimica',
    topicId: 'equilibrio_quimico',
    difficulty: 60,
    questionType: 'true_false',
    prompt: 'Analise a afirmação sobre o Princípio de Le Chatelier:',
    statement: 'A adição de um catalisador a um sistema químico em equilíbrio desloca o equilíbrio no sentido dos produtos e aumenta o rendimento final da reação.',
    isTrue: false,
    explanation: 'Falso! O catalisador apenas diminui a energia de ativação e acelera a velocidade para atingir o equilíbrio, sem alterar a constante de equilíbrio nem o rendimento final.',
    keyConcept: 'Catalisadores e Equilíbrio Químico',
    source: 'FUVEST',
    tags: ['cinética', 'equilíbrio'],
    examProfiles: ['FUVEST', 'UNICAMP'],
  },
  {
    id: 'quim_004',
    subjectId: 'quimica',
    topicId: 'estrutura_atomica',
    difficulty: 35,
    questionType: 'matching',
    prompt: 'Relacione os cientistas ao modelo atômico correspondente:',
    pairs: [
      { id: 'q1', left: 'Dalton', right: 'Esfera maciça, indivisível (bola de bilhar)' },
      { id: 'q2', left: 'Thomson', right: 'Esfera positiva com elétrons incrustados (pudim de passas)' },
      { id: 'q3', left: 'Rutherford', right: 'Núcleo denso positivo com eletrosfera vazia (planetário)' },
      { id: 'q4', left: 'Bohr', right: 'Níveis de energia quantizados e órbitas circulares' },
    ],
    explanation: 'Evolução dos modelos atômicos clássicos: Dalton (maciço) -> Thomson (descoberta do elétron) -> Rutherford (núcleo) -> Bohr (quantização).',
    keyConcept: 'Modelos Atômicos',
    source: 'FATEC',
    tags: ['átomo', 'história da química'],
    examProfiles: ['FATEC', 'ENEM'],
  },

  // ==========================================
  // BIOLOGIA
  // ==========================================
  {
    id: 'bio_001',
    subjectId: 'biologia',
    topicId: 'citologia_bioquimica',
    difficulty: 25,
    questionType: 'multiple_choice',
    prompt: 'Qual organela citoplasmática é a principal responsável pela síntese de ATP por meio da respiração celular aeróbica em células eucarióticas?',
    options: [
      { id: 'A', text: 'Complexo Golgiense' },
      { id: 'B', text: 'Ribossomo' },
      { id: 'C', text: 'Mitocôndria' },
      { id: 'D', text: 'Lisossomo' },
      { id: 'E', text: 'Retículo Endoplasmático Liso' },
    ],
    correctOptionId: 'C',
    explanation: 'A mitocôndria realiza o Ciclo de Krebs e a Cadeia Respiratória (Fosforilação Oxidativa), produzindo a maior parte do ATP da célula.',
    keyConcept: 'Bioenergética Celular',
    source: 'FATEC 2024',
    tags: ['citologia', 'organelas'],
    examProfiles: ['FATEC', 'ENEM', 'UNESP'],
  },
  {
    id: 'bio_002',
    subjectId: 'biologia',
    topicId: 'genetica_mendeliana',
    difficulty: 50,
    questionType: 'multiple_choice',
    prompt: 'Em humanos, o albinismo é uma condição autossômica recessiva (a). Se um casal com pigmentação normal, ambos heterozigotos (Aa), tiver um filho, qual é a probabilidade de a criança nascer albina?',
    options: [
      { id: 'A', text: '0%' },
      { id: 'B', text: '25% (1/4)' },
      { id: 'C', text: '50% (1/2)' },
      { id: 'D', text: '75% (3/4)' },
      { id: 'E', text: '100%' },
    ],
    correctOptionId: 'B',
    explanation: 'Cruzamento Aa x Aa: descendentes possíveis AA (25%), Aa (50%), aa (25%). O albinismo só se manifesta em homozigose recessiva (aa), resultando em 25% de probabilidade.',
    keyConcept: 'Primeira Lei de Mendel',
    source: 'ENEM 2023',
    tags: ['genética', 'Mendel'],
    examProfiles: ['ENEM', 'FUVEST', 'FATEC'],
  },
  {
    id: 'bio_003',
    subjectId: 'biologia',
    topicId: 'ecologia_biomas',
    difficulty: 40,
    questionType: 'flashcard',
    prompt: 'O que caracteriza a biomagnificação (ou magnificação trófica) em ecossistemas?',
    frontPrompt: 'O que é Magnificação Trófica (Biomagnificação)?',
    backResponse: 'É o acúmulo progressivo de substâncias tóxicas não biodegradáveis (como mercúrio e DDT) ao longo dos níveis tróficos de uma cadeia alimentar, atingindo maior concentração nos predadores de topo.',
    explanation: 'Diferente da bioacumulação (em um único indivíduo), a biomagnificação ocorre ao longo de toda a cadeia alimentar.',
    keyConcept: 'Impactos Ambientais e Cadeias Alimentares',
    source: 'ENEM',
    tags: ['ecologia', 'poluição'],
    examProfiles: ['ENEM', 'FUVEST'],
  },

  // ==========================================
  // PORTUGUÊS & GRAMÁTICA
  // ==========================================
  {
    id: 'port_001',
    subjectId: 'portugues',
    topicId: 'regencia_crase',
    difficulty: 45,
    questionType: 'multiple_choice',
    prompt: 'Assinale a alternativa em que o uso do acento grave indicativo de crase está CORRETO conforme a norma-padrão:',
    options: [
      { id: 'A', text: 'Ele começou à falar sem pensar duas vezes.' },
      { id: 'B', text: 'Chegamos à cidade antes do anoitecer.' },
      { id: 'C', text: 'Entregou o presente à ela com carinho.' },
      { id: 'D', text: 'Fomos à pé até a estação central.' },
      { id: 'E', text: 'O candidato obedeceu à todas as normas.' },
    ],
    correctOptionId: 'B',
    explanation: 'Chegar rege a preposição "a" e "cidade" é substantivo feminino com artigo "a" (a + a = à). Não ocorre crase antes de verbo (falar), pronome pessoal (ela), palavra masculina (pé) ou palavra no plural com "a" no singular (a todas).',
    keyConcept: 'Regras de Emprego da Crase',
    source: 'FATEC 2024',
    tags: ['crase', 'gramática', 'norma culta'],
    examProfiles: ['FATEC', 'ENEM', 'UNESP', 'FUVEST'],
  },
  {
    id: 'port_002',
    subjectId: 'portugues',
    topicId: 'semantica_figuras',
    difficulty: 40,
    questionType: 'multiple_choice',
    prompt: 'No verso machadiano: "O tempo é um rato roedor das coisas", qual figura de linguagem predomina?',
    options: [
      { id: 'A', text: 'Eufemismo' },
      { id: 'B', text: 'Metáfora' },
      { id: 'C', text: 'Metonímia' },
      { id: 'D', text: 'Hipérbole' },
      { id: 'E', text: 'Pleonasmo' },
    ],
    correctOptionId: 'B',
    explanation: 'Trata-se de uma metáfora: uma comparação implícita direta entre "o tempo" e "um rato roedor", atribuindo qualidades corrosivas ao tempo sem conectivo comparativo.',
    keyConcept: 'Figuras de Linguagem e Estilística',
    source: 'FUVEST',
    tags: ['figuras de linguagem', 'estilística'],
    examProfiles: ['FUVEST', 'ENEM', 'FATEC'],
  },

  // ==========================================
  // INTERPRETAÇÃO DE TEXTO
  // ==========================================
  {
    id: 'interp_001',
    subjectId: 'interpretacao',
    topicId: 'coesao_coerencia',
    difficulty: 35,
    questionType: 'multiple_choice',
    prompt: 'Considere o trecho: "O projeto de lei foi aprovado pela câmara; CONUDO, enfrentou forte resistência da sociedade civil." A conjunção em destaque estabelece entre as orações uma relação de:',
    options: [
      { id: 'A', text: 'Causa' },
      { id: 'B', text: 'Adição' },
      { id: 'C', text: 'Adversidade (Oposição)' },
      { id: 'D', text: 'Conclusão' },
      { id: 'E', text: 'Concessão' },
    ],
    correctOptionId: 'C',
    explanation: '"Contudo", assim como "porém", "todavia", "entretanto" e "mas", é uma conjunção coordenativa adversativa, indicando contraste/oposição de ideias.',
    keyConcept: 'Operadores Argumentativos e Coesão',
    source: 'ENEM 2023',
    tags: ['conectivos', 'interpretação', 'coesão'],
    examProfiles: ['ENEM', 'FATEC', 'UNICAMP'],
  },

  // ==========================================
  // LITERATURA
  // ==========================================
  {
    id: 'lit_001',
    subjectId: 'literatura',
    topicId: 'realismo_naturalismo',
    difficulty: 45,
    questionType: 'multiple_choice',
    prompt: 'Em "Memórias Póstumas de Brás Cubas" (1881), de Machado de Assis, o narrador defunto inaugura o Realismo brasileiro principalmente por meio de:',
    options: [
      { id: 'A', text: 'Idealização heroica dos personagens e exaltação da pátria' },
      { id: 'B', text: 'Ironia fina, pessimismo lúcido e desconstrução da hipocrisia da elite burguesa' },
      { id: 'C', text: 'Determinismo biológico absoluto e zoomorfização dos indivíduos' },
      { id: 'D', text: 'Misticismo religioso e temática pastoral clássica' },
      { id: 'E', text: 'Linguagem empolada parnasiana e rigor métrico sonetista' },
    ],
    correctOptionId: 'B',
    explanation: 'A narrativa machadiana destaca-se pelo narrador em primeira pessoa com distanciamento moral (póstumo), ironia cirúrgica e crítica à futilidade e hipocrisia social.',
    keyConcept: 'Realismo Machadiano',
    source: 'FUVEST 2023',
    tags: ['literatura', 'Machado de Assis', 'Realismo'],
    examProfiles: ['FUVEST', 'UNICAMP', 'ENEM', 'FATEC'],
  },
  {
    id: 'lit_002',
    subjectId: 'literatura',
    topicId: 'modernismo_fase1',
    difficulty: 50,
    questionType: 'matching',
    prompt: 'Associe os grandes autores modernistas brasileiros às suas obras canônicas:',
    pairs: [
      { id: 'l1', left: 'Graciliano Ramos', right: 'Vidas Secas' },
      { id: 'l2', left: 'Mário de Andrade', right: 'Macunaíma' },
      { id: 'l3', left: 'Guimarães Rosa', right: 'Grande Sertão: Veredas' },
      { id: 'l4', left: 'Clarice Lispector', right: 'A Hora da Estrela' },
    ],
    explanation: 'Obras fundamentais do Modernismo: Graciliano (romance de 30), Mário (antropofagia de 22), Guimarães Rosa e Clarice (Geração de 45).',
    keyConcept: 'Cânone Literário Brasileiro',
    source: 'FATEC',
    tags: ['modernismo', 'obras canônicas'],
    examProfiles: ['FATEC', 'FUVEST', 'UNICAMP', 'ENEM'],
  },

  // ==========================================
  // HISTÓRIA
  // ==========================================
  {
    id: 'hist_001',
    subjectId: 'historia',
    topicId: 'brasil_republica_velha',
    difficulty: 45,
    questionType: 'multiple_choice',
    prompt: 'Durante a Primeira República Brasileira (1889-1930), a prática política conhecida como "coronelismo" baseava-se fundamentalmente:',
    options: [
      { id: 'A', text: 'No voto secreto e na ampla participação popular democrática' },
      { id: 'B', text: 'No controle do eleitorado local por grandes proprietários através do "voto de cabresto" e clientelismo' },
      { id: 'C', text: 'No domínio exclusivo do exército sobre todas as esferas do governo federal' },
      { id: 'D', text: 'Na centralização do poder absolutista em torno do presidente da República' },
      { id: 'E', text: 'Na industrialização acelerada das capitais com sindicatos fortes' },
    ],
    correctOptionId: 'B',
    explanation: 'O coronelismo assentava-se no poder local dos latifundiários que coagiam agregados e eleitores (voto de cabresto), sustentando a Política dos Governadores e o pacto café com leite.',
    keyConcept: 'República Velha e Coronelismo',
    source: 'FATEC 2023',
    tags: ['história do brasil', 'república velha'],
    examProfiles: ['FATEC', 'ENEM', 'FUVEST'],
  },
  {
    id: 'hist_002',
    subjectId: 'historia',
    topicId: 'guerras_mundiais_totalitarismo',
    difficulty: 55,
    questionType: 'ordering',
    prompt: 'Ordene cronologicamente os seguintes acontecimentos históricos do século XX:',
    items: [
      { id: 'o1', text: 'Tratado de Versalhes e fim da Primeira Guerra Mundial', correctOrder: 0 },
      { id: 'o2', text: 'Quebra da Bolsa de Nova York (Crise de 1929)', correctOrder: 1 },
      { id: 'o3', text: 'Fim da Segunda Guerra Mundial e criação da ONU', correctOrder: 2 },
      { id: 'o4', text: 'Queda do Muro de Berlim', correctOrder: 3 },
    ],
    explanation: 'Cronologia: Tratado de Versalhes (1919) -> Crise de 1929 -> Fim da 2ª Guerra/ONU (1945) -> Queda do Muro de Berlim (1989).',
    keyConcept: 'Linha do Tempo do Século XX',
    source: 'UNICAMP',
    tags: ['história geral', 'século xx'],
    examProfiles: ['UNICAMP', 'FUVEST', 'ENEM'],
  },

  // ==========================================
  // GEOGRAFIA
  // ==========================================
  {
    id: 'geo_001',
    subjectId: 'geografia',
    topicId: 'biomas_vegetacao',
    difficulty: 40,
    questionType: 'multiple_choice',
    prompt: 'Qual bioma brasileiro é caracterizado por árvores de casca grossa e troncos tortuosos, solos ácidos e profundos, e uma rica biodiversidade adaptada a um regime com estação seca bem definida, sendo considerado a "caixa d’água" do Brasil?',
    options: [
      { id: 'A', text: 'Pampa' },
      { id: 'B', text: 'Cerrado' },
      { id: 'C', text: 'Caatinga' },
      { id: 'D', text: 'Mata Atlântica' },
      { id: 'E', text: 'Pantanal' },
    ],
    correctOptionId: 'B',
    explanation: 'O Cerrado abriga as nascentes das principais bacias hidrográficas do Brasil (São Francisco, Tocantins/Araguaia e Paraná/Paraguai), merecendo o título de caixa d’água do país.',
    keyConcept: 'Biomas Brasileiros e Hidrografia',
    source: 'ENEM 2023',
    tags: ['geografia', 'biomas', 'meio ambiente'],
    examProfiles: ['ENEM', 'FATEC', 'FUVEST'],
  },

  // ==========================================
  // INGLÊS
  // ==========================================
  {
    id: 'ing_001',
    subjectId: 'ingles',
    topicId: 'false_friends_vocab',
    difficulty: 30,
    questionType: 'multiple_choice',
    prompt: 'No trecho: "She actually managed to solve the problem before the deadline", a palavra "actually" significa:',
    options: [
      { id: 'A', text: 'Atualmente' },
      { id: 'B', text: 'Na realidade / De fato' },
      { id: 'C', text: 'Atualmente não' },
      { id: 'D', text: 'Rapidamente' },
      { id: 'E', text: 'Eventualmente' },
    ],
    correctOptionId: 'B',
    explanation: '"Actually" é um clássico falso cognato (false friend) e significa "na verdade", "de fato" ou "realmente". "Atualmente" em inglês é "currently" ou "nowadays".',
    keyConcept: 'Falsos Cognatos em Inglês',
    source: 'FATEC 2024',
    tags: ['inglês', 'vocabulário', 'falsos cognatos'],
    examProfiles: ['FATEC', 'ENEM', 'FUVEST'],
  },

  // ==========================================
  // FILOSOFIA
  // ==========================================
  {
    id: 'filo_001',
    subjectId: 'filosofia',
    topicId: 'filosofia_moderna_contratualismo',
    difficulty: 45,
    questionType: 'multiple_choice',
    prompt: 'Para Thomas Hobbes, em sua obra "Leviatã", a transição do estado de natureza (marcado pela guerra de todos contra todos) para a sociedade civil ocorre através de:',
    options: [
      { id: 'A', text: 'Um contrato social no qual os indivíduos renunciam à sua liberdade irrestrita em troca de segurança e ordem garantidas pelo Estado Soberano' },
      { id: 'B', text: 'Um pacto democrático direto no qual o povo governa sem intermediários nem soberanos' },
      { id: 'C', text: 'Uma revolução dos trabalhadores contra a opressão dos proprietários' },
      { id: 'D', text: 'A aceitação da vontade divina transmitida aos reis pela igreja' },
      { id: 'E', text: 'O isolamento individual voluntário da vida urbana' },
    ],
    correctOptionId: 'A',
    explanation: 'Hobbes defende que o medo da morte violenta leva os homens a celebrarem o pacto social, transferindo o monopólio da força ao Leviatã (Estado absolutista/soberano).',
    keyConcept: 'Contratualismo Hobbesiano',
    source: 'ENEM 2023',
    tags: ['filosofia política', 'contratualismo'],
    examProfiles: ['ENEM', 'FUVEST', 'UNICAMP'],
  },

  // ==========================================
  // SOCIOLOGIA
  // ==========================================
  {
    id: 'soc_001',
    subjectId: 'sociologia',
    topicId: 'sociologia_classica',
    difficulty: 40,
    questionType: 'multiple_choice',
    prompt: 'Segundo Émile Durkheim, os "fatos sociais" constituem o objeto próprio de estudo da sociologia. Quais são suas três características fundamentais?',
    options: [
      { id: 'A', text: 'Individualidade, voluntarismo e flexibilidade' },
      { id: 'B', text: 'Coercitividade, exterioridade e generalidade' },
      { id: 'C', text: 'Subjetividade, historicidade e mutabilidade' },
      { id: 'D', text: 'Luta de classes, alienação e infraestrutura' },
      { id: 'E', text: 'Ação racional, carisma e tradição' },
    ],
    correctOptionId: 'B',
    explanation: 'Para Durkheim, fatos sociais existem fora do indivíduo (exterioridade), impõem-se como regra social (coercitividade) e estão presentes em toda a sociedade (generalidade).',
    keyConcept: 'Metodologia Durkheimiana',
    source: 'ENEM',
    tags: ['sociologia clássica', 'Durkheim'],
    examProfiles: ['ENEM', 'FUVEST', 'UNESP'],
  },

  // ==========================================
  // REDAÇÃO & REPERTÓRIO
  // ==========================================
  {
    id: 'red_001',
    subjectId: 'redacao',
    topicId: 'proposta_intervencao_enem',
    difficulty: 35,
    questionType: 'multiple_choice',
    prompt: 'Na Competência 5 da redação do ENEM, a proposta de intervenção completa exige a presença de 5 elementos obrigatórios. Quais são eles?',
    options: [
      { id: 'A', text: 'Tese, Argumento 1, Argumento 2, Alusão Histórica e Conclusão' },
      { id: 'B', text: 'Agente, Ação, Meio/Modo, Efeito/Finalidade e Detalhamento de um dos elementos' },
      { id: 'C', text: 'Governo, População, Mídia, Escolas e Famílias' },
      { id: 'D', text: 'Título, Introdução, Desenvolvimento, Síntese e Citação' },
      { id: 'E', text: 'Problema, Causa, Consequência, Punição e Desfecho' },
    ],
    correctOptionId: 'B',
    explanation: 'A nota máxima (200 pontos) na Competência 5 do ENEM exige: Quem fará (Agente), O que fará (Ação), Como fará (Modo/Meio), Para que fará (Efeito) e uma informação explicativa adicional (Detalhamento).',
    keyConcept: 'Proposta de Intervenção Nota 1000',
    source: 'ENEM Oficial',
    tags: ['redação', 'competência 5', 'intervenção'],
    examProfiles: ['ENEM'],
  },

  // ==========================================
  // RACIOCÍNIO LÓGICO
  // ==========================================
  {
    id: 'log_001',
    subjectId: 'raciocinio_logico',
    topicId: 'proposicoes_conectivos',
    difficulty: 45,
    questionType: 'multiple_choice',
    prompt: 'A negação lógica da proposição "Todos os alunos estudaram e passaram na prova" é:',
    options: [
      { id: 'A', text: 'Nenhum aluno estudou e nenhum passou na prova' },
      { id: 'B', text: 'Pelo menos um aluno não estudou ou não passou na prova' },
      { id: 'C', text: 'Todos os alunos não estudaram e reprovaram' },
      { id: 'D', text: 'Algum aluno estudou mas não passou na prova' },
      { id: 'E', text: 'Pelo menos um aluno estudou e passou' },
    ],
    correctOptionId: 'B',
    explanation: 'A negação de "Todo A é B" é "Pelo menos um A não é B" (ou "Existe algum A que não é B"). Pela Lei de De Morgan, a negação de (P e Q) é (~P ou ~Q). Portanto: "Pelo menos um aluno não estudou OU não passou na prova".',
    keyConcept: 'Negação de Proposições e Quantificadores Lógicos',
    source: 'FATEC 2023',
    tags: ['raciocínio lógico', 'De Morgan'],
    examProfiles: ['FATEC', 'FUVEST'],
  },
];

export class QuestionBankService {
  private static cache: Map<string, EducationalQuestion[]> = new Map();

  public static getAllQuestions(): EducationalQuestion[] {
    return QUESTION_BANK;
  }

  public static getQuestionsBySubject(subjectId: SubjectId): EducationalQuestion[] {
    return QUESTION_BANK.filter((q) => q.subjectId === subjectId);
  }

  public static getQuestionsByTopic(subjectId: SubjectId, topicId: string): EducationalQuestion[] {
    return QUESTION_BANK.filter((q) => q.subjectId === subjectId && q.topicId === topicId);
  }

  public static getQuestionsByExamProfile(examProfileId: string): EducationalQuestion[] {
    return QUESTION_BANK.filter(
      (q) => q && (!q.examProfiles || q.examProfiles.includes(examProfileId) || q.examProfiles.length === 0)
    );
  }

  public static getQuestionById(id: string): EducationalQuestion | undefined {
    return QUESTION_BANK.find((q) => q && q.id === id);
  }

  public static getRandomQuestions(
    options: {
      subjectId?: SubjectId;
      topicId?: string;
      questionType?: string;
      count?: number;
      examProfileId?: string;
      excludeIds?: string[];
      minDifficulty?: number;
      maxDifficulty?: number;
    } = {}
  ): EducationalQuestion[] {
    let pool = QUESTION_BANK.filter((q): q is EducationalQuestion => Boolean(q && q.id));

    if (options.subjectId) {
      pool = pool.filter((q) => q.subjectId === options.subjectId);
    }
    if (options.topicId) {
      pool = pool.filter((q) => q.topicId === options.topicId);
    }
    if (options.questionType) {
      pool = pool.filter((q) => q.questionType === options.questionType);
    }
    if (options.examProfileId) {
      pool = pool.filter(
        (q) => !q.examProfiles || q.examProfiles.includes(options.examProfileId!) || q.examProfiles.length === 0
      );
    }
    if (options.excludeIds && options.excludeIds.length > 0) {
      const excludeSet = new Set(options.excludeIds);
      pool = pool.filter((q) => !excludeSet.has(q.id));
    }
    if (options.minDifficulty !== undefined) {
      pool = pool.filter((q) => q.difficulty >= options.minDifficulty!);
    }
    if (options.maxDifficulty !== undefined) {
      pool = pool.filter((q) => q.difficulty <= options.maxDifficulty!);
    }

    // Shuffle pool
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const count = options.count || 10;
    return shuffled.slice(0, count);
  }

  public static getFilteredQuestions(options: {
    subjectId?: SubjectId;
    topicId?: string;
    questionType?: string;
    count?: number;
    examProfileId?: string;
    excludeIds?: string[];
    minDifficulty?: number;
    maxDifficulty?: number;
  } = {}): EducationalQuestion[] {
    return this.getRandomQuestions(options);
  }
}
