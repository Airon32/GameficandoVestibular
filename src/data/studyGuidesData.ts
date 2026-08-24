import { StudyGuide, SubjectId } from '../types';
import { EXPANDED_STUDY_GUIDES } from './expandedStudyGuides';

/**
 * Structured Mini Apostilas (Study Guides)
 * Format:
 * 1. O QUE É (Short concept)
 * 2. FÓRMULA / REGRAS PRINCIPAIS
 * 3. COMO RESOLVER (Passo a passo ou tabela comparativa)
 * 4. EXEMPLO RESOLVIDO
 * 5. ERROS COMUNS / PEGADINHAS DE VESTIBULAR
 * 6. RESUMO (3 a 5 pontos)
 * 7. TESTAR CONHECIMENTO & TREINAR AGORA
 */
const CORE_STUDY_GUIDES: StudyGuide[] = [
  // =========================================================================
  // MATEMÁTICA: PORCENTAGEM & AUMENTOS SUCESSIVOS
  // =========================================================================
  {
    id: 'guide_mat_porcentagem',
    subjectId: 'matematica',
    topicId: 'porcentagem',
    title: 'Mini Apostila: Porcentagem e Aumentos Sucessivos',
    subtitle: 'Domine fatores multiplicativos, variações e pegadinhas de vestibulares em 4 minutos.',
    estimatedReadMinutes: 4,
    tags: ['porcentagem', 'matematica_financeira', 'vestibular', 'fatec', 'enem'],
    sections: [
      {
        title: '1. O Que É?',
        type: 'concept',
        content: 'Porcentagem é uma razão cujo denominador é 100. Representa uma fração centesimal de um determinado valor total. Em vestibulares, o segredo da agilidade é utilizar o Fator Multiplicativo.',
      },
      {
        title: '2. Fórmulas e Fatores Principais',
        type: 'formulas',
        content: 'Para evitar regras de três demoradas, utilize os multiplicadores diretos:',
        latex: 'F_{aumento} = (1 + \\frac{i}{100}) \\quad | \\quad F_{desconto} = (1 - \\frac{i}{100})',
        items: [
          'Aumento de 10% → Multiplique por 1,10',
          'Aumento de 35% → Multiplique por 1,35',
          'Desconto de 20% → Multiplique por 0,80 (1 - 0,20)',
          'Desconto de 8% → Multiplique por 0,92 (1 - 0,08)',
          'Aumentos Sucessivos: Multiplique os fatores entre si: F_total = F₁ × F₂ × ... × Fₙ',
        ],
      },
      {
        title: '3. Passo a Passo de Resolução',
        type: 'step_by_step',
        content: 'Como resolver questões de aumentos ou descontos sucessivos:',
        items: [
          'Passo 1: Identifique a taxa de cada etapa (ex: +20% e depois +30%).',
          'Passo 2: Converta cada taxa para seu fator multiplicativo (1,20 e 1,30).',
          'Passo 3: Multiplique os fatores: 1,20 × 1,30 = 1,56.',
          'Passo 4: Subtraia 1 e multiplique por 100: (1,56 - 1) × 100 = 56% de aumento real.',
        ],
      },
      {
        title: '4. Exemplo Resolvido de Vestibular',
        type: 'example',
        content: 'Questão (FATEC): Um produto de R$ 200,00 sofreu um aumento de 20% e, no mês seguinte, um novo aumento de 10%. Qual é o valor final?',
        latex: 'V_{final} = 200 \\times 1,20 \\times 1,10 = 240 \\times 1,10 = R\\$ 264,00',
        items: [
          '1º aumento: 200 × 1,20 = R$ 240,00',
          '2º aumento: 240 × 1,10 = R$ 264,00',
          'Aumento acumulado: 1,20 × 1,10 = 1,32 (32% de aumento total sobre R$ 200).',
        ],
      },
    ],
    commonMistakes: [
      {
        title: 'Somar porcentagens sucessivas diretamente',
        mistake: 'Dizer que aumentar 20% e depois 20% resulta em um aumento total de 40%.',
        correction: 'O segundo aumento incide sobre o valor já inflacionado! Fator: 1,20 × 1,20 = 1,44 (Aumento real de 44%).',
      },
      {
        title: 'Aumento seguido de desconto idêntico',
        mistake: 'Achar que subir 25% e abaixar 25% devolve o preço original.',
        correction: '1,25 × 0,75 = 0,9375. Há uma perda de 6,25% em relação ao preço inicial.',
      },
    ],
    quickSummary: [
      'Porcentagem é razão sobre 100.',
      'Aumentar i% = multiplicar por (1 + i/100).',
      'Descontar i% = multiplicar por (1 - i/100).',
      'Variações sucessivas NUNCA se somam: sempre se multiplicam os fatores.',
      'Aumento de X% e desconto de X% sempre gera redução no valor final.',
    ],
    sampleQuestion: {
      prompt: 'Um ingresso de R$ 80,00 teve um aumento de 25% seguido de um desconto de 10%. Qual o valor final pago?',
      solutionSteps: [
        'Fator de aumento de 25%: 1,25',
        'Fator de desconto de 10%: 0,90',
        'Fator combinado: 1,25 × 0,90 = 1,125',
        'Valor final: 80 × 1,125 = R$ 90,00',
      ],
      answer: 'R$ 90,00',
    },
    quizQuestionIds: ['mat_porc_tpl_1', 'mat_porc_tpl_2', 'mat_porc_1', 'mat_porc_2', 'mat_porc_3'],
  },

  // =========================================================================
  // BIOLOGIA: MITOCÔNDRIA & RESPIRAÇÃO CELULAR
  // =========================================================================
  {
    id: 'guide_bio_mitocondria',
    subjectId: 'biologia',
    topicId: 'metabolismo_energetico',
    title: 'Mini Apostila: Mitocôndria e Respiração Celular',
    subtitle: 'Entenda bioenergética celular, ATP e teoria endossimbiótica em 3 minutos.',
    estimatedReadMinutes: 3,
    tags: ['citologia', 'bioenergetica', 'mitocondria', 'atp', 'fatec', 'enem'],
    sections: [
      {
        title: '1. O Que É?',
        type: 'concept',
        content: 'A mitocôndria é a organela celular membranosa responsável pela produção de ATP (adenosina trifosfato) através da respiração celular aeróbia.',
      },
      {
        title: '2. Etapas da Respiração Celular',
        type: 'step_by_step',
        content: 'A degradação completa da glicose ocorre em três etapas fundamentais:',
        items: [
          '1. Glicólise (Citosol / Hialoplasma): Quebra anaeróbia da glicose em 2 piruvatos. Saldo de 2 ATP.',
          '2. Ciclo de Krebs (Matriz Mitocondrial): Descarboxilação e geração de elétrons transportados por NADH e FADH2. Saldo de 2 ATP.',
          '3. Fosforilação Oxidativa (Cristas Mitocondriais): Cadeia respiratória de elétrons acoplada à ATP sintase com oxigênio como aceptor final. Saldo massivo de ~26 a 28 ATP.',
        ],
      },
      {
        title: '3. Características Especiais (Endossimbiose)',
        type: 'concept',
        content: 'A teoria da endossimbiose propõe que mitocôndrias eram bactérias aeróbias primitivas incorporadas por células eucarióticas:',
        items: [
          'Possuem DNA próprio (circular, sem histonas)',
          'Possuem ribossomos próprios (70S, padrão bacteriano)',
          'Realizam autoduplicação independente por divisão binária',
          'Herança mitocondrial estritamente materna na espécie humana',
        ],
      },
    ],
    commonMistakes: [
      {
        title: 'Local da Glicólise',
        mistake: 'Achar que a glicólise ocorre dentro da mitocôndria.',
        correction: 'A glicólise ocorre no citoplasma (citosol); a mitocôndria recebe o piruvato gerado.',
      },
      {
        title: 'Aceptor final de elétrons',
        mistake: 'Achar que a glicose ou o gás carbônico é o aceptor final de elétrons.',
        correction: 'O aceptor final da cadeia respiratória aeróbia é o GÁS OXIGÊNIO (O2), que ao receber elétrons e prótons forma água (H2O).',
      },
    ],
    quickSummary: [
      'Mitocôndria = Usina energética da célula (produção de ATP).',
      'Glicólise ocorre no citosol; Ciclo de Krebs na matriz; Fosforilação nas cristas.',
      'O aceptor final de elétrons na respiração aeróbia é o O2.',
      'Células com alta demanda de energia (coração, músculos esqueléticos) têm muitas mitocôndrias.',
      'DNA mitocondrial é circular e transmitido pela mãe.',
    ],
    sampleQuestion: {
      prompt: 'Por que o veneno cianeto, que bloqueia a cadeia respiratória nas cristas mitocondriais, é letal?',
      solutionSteps: [
        'O cianeto inibe a citocromo c oxidase nas cristas mitocondriais.',
        'Isso impede a transferência de elétrons para o O2.',
        'Sem gradiente de prótons, cessa a produção de ATP.',
        'As células entram em colapso energético imediato.',
      ],
      answer: 'Interrompe a síntese de ATP por asfixia celular em nível mitocondrial.',
    },
    quizQuestionIds: ['bio_mito_tpl_1', 'bio_mito_tpl_2', 'bio_mito_tpl_3', 'bio_cito_1', 'bio_cito_2'],
  },

  // =========================================================================
  // FÍSICA: MRUV & EQUAÇÃO DE TORRICELLI
  // =========================================================================
  {
    id: 'guide_fis_mruv',
    subjectId: 'fisica',
    topicId: 'cinematica',
    title: 'Mini Apostila: MRUV e Torricelli',
    subtitle: 'Fórmulas essenciais, gráficos e quando usar cada equação sem perder tempo.',
    estimatedReadMinutes: 4,
    tags: ['cinematica', 'mruv', 'torricelli', 'aceleracao', 'fatec', 'enem'],
    sections: [
      {
        title: '1. O Que É?',
        type: 'concept',
        content: 'No Movimento Retilíneo Uniformemente Variado (MRUV), a aceleração escalar é constante e diferente de zero. A velocidade varia em taxas iguais a cada segundo.',
      },
      {
        title: '2. As 3 Fórmulas Fundamentais',
        type: 'formulas',
        content: 'Guarde este mapa mental para escolher a fórmula certa:',
        latex: 'v = v_0 + a \\cdot t \\quad | \\quad s = s_0 + v_0 \\cdot t + \\frac{a \\cdot t^2}{2} \\quad | \\quad v^2 = v_0^2 + 2 \\cdot a \\cdot \\Delta s',
        items: [
          'Vovô Ateu (v = v₀ + at): Use quando NÃO precisar de espaço (Δs).',
          'Sorvetão (s = s₀ + v₀t + at²/2): Use quando tiver tempo (t) e espaço (Δs).',
          'Torricelli (v² = v₀² + 2aΔs): O "Salva-Vidas" dos vestibulares! Use quando o problema NÃO informar e NÃO pedir o tempo (t).',
        ],
      },
      {
        title: '3. Queda Livre e Lançamento Vertical',
        type: 'step_by_step',
        content: 'A queda livre é um MRUV onde a aceleração é a gravidade (g ≅ 10 m/s²):',
        items: [
          'Abandonado do repouso: v₀ = 0.',
          'Tempo de queda: t = √(2h / g).',
          'Velocidade de impacto no solo: v = √(2gh).',
          'No ponto mais alto do lançamento vertical: a velocidade instantânea é nula (v = 0).',
        ],
      },
    ],
    commonMistakes: [
      {
        title: 'Usar v = Δs/Δt no MRUV',
        mistake: 'Aplicar a fórmula de velocidade constante quando existe aceleração.',
        correction: 'No MRUV a velocidade varia! Deve-se usar as funções horárias ou a velocidade média Vm = (v₀ + v)/2.',
      },
      {
        title: 'Esquecer o sinal da aceleração no lançamento vertical',
        mistake: 'Usar gravidade positiva quando o objeto está subindo e desacelerando.',
        correction: 'Na subida, a gravidade atua como retardadora (a = -g).',
      },
    ],
    quickSummary: [
      'Aceleração constante no MRUV.',
      'Sem tempo no enunciado? Use Torricelli: v² = v₀² + 2aΔs.',
      'Partiu do repouso = v₀ = 0.',
      'Ponto mais alto na subida = v = 0.',
      'No gráfico v × t, a área sob a curva é numericamente igual ao deslocamento Δs.',
    ],
    sampleQuestion: {
      prompt: 'Um carro a 72 km/h (20 m/s) freia com desaceleração constante de 4 m/s² até parar. Qual a distância de frenagem?',
      solutionSteps: [
        'v₀ = 20 m/s, v = 0 m/s, a = -4 m/s²',
        'Torricelli: 0² = 20² + 2(-4)Δs',
        '0 = 400 - 8Δs => 8Δs = 400 => Δs = 50 metros',
      ],
      answer: '50 metros',
    },
    quizQuestionIds: ['fis_mruv_tpl_1', 'fis_mruv_tpl_2', 'fis_cinem_1', 'fis_cinem_2', 'fis_cinem_3'],
  },

  // =========================================================================
  // PORTUGUÊS: REGRA DEFINITIVA DA CRASE
  // =========================================================================
  {
    id: 'guide_por_crase',
    subjectId: 'portugues',
    topicId: 'regencia_crase',
    title: 'Mini Apostila: A Regra Definitiva da Crase',
    subtitle: 'Casos proibidos, obrigatórios e facultativos com macetes práticos de prova.',
    estimatedReadMinutes: 4,
    tags: ['gramatica', 'crase', 'regencia', 'portugues', 'fatec', 'enem'],
    sections: [
      {
        title: '1. O Que É a Crase?',
        type: 'concept',
        content: 'Crase é a fusão da preposição "a" (exigida por um verbo ou nome) com o artigo definido feminino "a/as" ou os pronomes demonstrativos "aquele(s), aquela(s), aquilo". O acento grave (`) marca essa união.',
      },
      {
        title: '2. Macete de Ouro: A Troca pelo Masculino',
        type: 'step_by_step',
        content: 'Substitua a palavra feminina seguinte por um termo masculino equivalente:',
        items: [
          'Se virar "AO" diante do masculino → TEM CRASE (à/às). Ex: Vou à praia (Vou AO clube).',
          'Se virar "O" diante do masculino → NÃO TEM CRASE. Ex: Visitei a cidade (Visitei O parque).',
          'Se virar "A" diante do masculino → NÃO TEM CRASE. Ex: Refiro-me a pessoas (Refiro-me a homens).',
        ],
      },
      {
        title: '3. Casos Proibidos (NUNCA Use Crase)',
        type: 'common_mistakes',
        content: 'Em vestibulares, a maioria das alternativas erradas tenta usar crase nestes casos:',
        items: [
          '1. Antes de palavra masculina: Pagamento a prazo, andar a pé, bife a cavalo.',
          '2. Antes de verbos: Começou a chorar, disposto a ajudar.',
          '3. Antes de pronomes pessoais/de tratamento: Entregou a ela, disse a Vossa Excelência.',
          '4. Com "A" no singular diante de palavra no plural: Refiro-me a vagas (sem crase).',
          '5. Entre palavras repetidas: Cara a cara, dia a dia, gota a gota.',
        ],
      },
      {
        title: '4. Casos Facultativos (Tanto Faz)',
        type: 'concept',
        content: 'Memorize o mnemônico "Nomes de Mulher, Minha, Até":',
        items: [
          '1. Antes de nomes próprios femininos: Entreguei a (ou à) Maria.',
          '2. Antes de pronomes possessivos femininos no singular: Refiro-me a (ou à) minha mãe.',
          '3. Depois da preposição "até": Fui até a (ou à) praia.',
        ],
      },
    ],
    commonMistakes: [
      {
        title: 'Crase antes de verbo',
        mistake: 'Escrever "Começou à fazer exercícios".',
        correction: 'Verbo não admite artigo feminino! O correto é "Começou a fazer".',
      },
      {
        title: 'Crase antes de palavra masculina',
        mistake: 'Escrever "Comprei à vista e vendi à prazo".',
        correction: '"À vista" tem crase (locução adverbial feminina), mas "a prazo" é masculino e NÃO leva crase.',
      },
    ],
    quickSummary: [
      'Troca pelo masculino: Virou AO? Crase no A.',
      'Nunca ocorre crase antes de verbo, palavra masculina ou pronome pessoal.',
      'Locuções femininas adverbiais/prepositivas/conjuntivas SEMPRE têm crase (à noite, à tarde, às vezes, à medida que).',
      'Facultativa: Nomes próprios femininos, possessivo feminino singular (minha/tua/sua) e após "até".',
    ],
    sampleQuestion: {
      prompt: 'Em "O candidato dedicou-se ___ tarefas e chegou ___ tempo ___ prova", preencha corretamente com as ou às, a ou à.',
      solutionSteps: [
        '1. Dedicou-se às tarefas (dedicou-se aos trabalhos => às).',
        '2. Chegou a tempo (tempo é masculino => a).',
        '3. Chegou à prova (chegou ao exame => à).',
      ],
      answer: 'às – a – à',
    },
    quizQuestionIds: ['por_crase_tpl_1', 'por_crase_tpl_2', 'por_gram_1', 'por_gram_2', 'por_gram_3'],
  },

  // =========================================================================
  // HISTÓRIA: REVOLUÇÃO FRANCESA (1789)
  // =========================================================================
  {
    id: 'guide_his_revolucao_francesa',
    subjectId: 'historia',
    topicId: 'revolucoes_burguesas',
    title: 'Mini Apostila: Revolução Francesa (1789–1799)',
    subtitle: 'Causas, fases, personagens e o fim do Antigo Regime resumidos para gabaritar.',
    estimatedReadMinutes: 5,
    tags: ['historia_geral', 'revolucao_francesa', 'iluminismo', 'antigo_regime', 'fatec', 'enem'],
    sections: [
      {
        title: '1. O Cenário Pré-Revolucionário (Antigo Regime)',
        type: 'concept',
        content: 'A França do século XVIII vivia uma grave crise econômica provocada por gastos da corte de Luís XVI, secas agrícolas e dívidas de guerras. A sociedade era dividida em três estados:',
        items: [
          '1º Estado: Clero (0,5% da população) - Isento de impostos e dono de terras.',
          '2º Estado: Nobreza (1,5% da população) - Isenta de impostos, cargos públicos e pensões reais.',
          '3º Estado: Burguesia, Camponeses e Sans-culottes (98% da população) - Sustentava todo o Estado com tributos e sem poder político.',
        ],
      },
      {
        title: '2. Principais Fases da Revolução',
        type: 'step_by_step',
        content: 'Linha do tempo essencial das etapas revolucionárias:',
        items: [
          '1. Assembleia Nacional Constituinte (1789-1791): Queda da Bastilha (14 de julho de 1789), abolição dos privilégios feudais e Declaração dos Direitos do Homem e do Cidadão.',
          '2. Monarquia Constitucional (1791-1792): Voto censitário, tentativa de fuga do Rei Luís XVI e invasão estrangeira.',
          '3. Convenção Nacional / Fase Jacobina (1792-1794): Proclamação da República, execução do Rei na guilhotina, voto universal masculino, Lei do Máximo e o Período do Terror sob liderança de Robespierre.',
          '4. Diretório e Reação Termidoriana (1794-1799): Alta burguesia (girondinos) retoma o poder, restaura o voto censitário e encerra o Terror.',
          '5. Golpe do 18 de Brumário (1799): Napoleão Bonaparte assume o poder para estabilizar os ganhos burgueses.',
        ],
      },
    ],
    commonMistakes: [
      {
        title: 'Caráter social da Revolução Francesa',
        mistake: 'Achar que a Revolução Francesa foi uma revolução operária/socialista.',
        correction: 'Foi uma REVOLUÇÃO BURGUESA. A burguesia liderou o processo para derrubar as amarras feudais e consolidar o capitalismo liberal.',
      },
      {
        title: 'Girondinos versus Jacobinos',
        mistake: 'Inverter os papéis dos dois grupos políticos da Convenção.',
        correction: 'Girondinos = Alta burguesia moderada (sentavam à direita). Jacobinos = Pequena burguesia e sans-culottes radicais (sentavam à esquerda / Montanha).',
      },
    ],
    quickSummary: [
      'Causa: Crise financeira e desigualdade do Terceiro Estado sustentando o 1º e 2º Estados.',
      'Símbolo inaugural: Queda da Bastilha em 14 de julho de 1789.',
      'Marco jurídico: Declaração dos Direitos do Homem e do Cidadão (Liberdade, Igualdade e Fraternidade).',
      'Fase do Terror (1793-1794): Jacobinos e Robespierre guilhotinam opositores e tabelam preços.',
      'Desfecho: Reação Termidoriana leva ao Golpe do 18 de Brumário com Napoleão Bonaparte.',
    ],
    sampleQuestion: {
      prompt: 'Qual foi o principal impacto da Declaração dos Direitos do Homem e do Cidadão de 1789 para o mundo ocidental?',
      solutionSteps: [
        'Consagrou a igualdade jurídica de todos os cidadãos perante a lei.',
        'Extinguiu formalmente a sociedade estamental de privilégios hereditários de nascimento.',
        'Instituiu a soberania popular e a liberdade de expressão e propriedade.',
      ],
      answer: 'Extinção jurídica dos privilégios da nobreza e consagração da igualdade civil perante a lei.',
    },
    quizQuestionIds: ['his_rev_fr_tpl_1', 'his_geral_1', 'his_geral_2', 'his_geral_3', 'his_geral_4'],
  },

  // =========================================================================
  // QUÍMICA: CÁLCULO ESTEQUIOMÉTRICO
  // =========================================================================
  {
    id: 'guide_qui_estequiometria',
    subjectId: 'quimica',
    topicId: 'estequiometria',
    title: 'Mini Apostila: Cálculo Estequiométrico',
    subtitle: 'Relações molares, volume molar e reagente limitante em 4 passos infalíveis.',
    estimatedReadMinutes: 4,
    tags: ['quimica_geral', 'estequiometria', 'mols', 'lavoisier', 'fatec', 'enem'],
    sections: [
      {
        title: '1. O Que É?',
        type: 'concept',
        content: 'Cálculo estequiométrico é o cálculo das quantidades de reagentes e produtos envolvidos em uma reação química, fundamentado na Lei de Lavoisier (conservação de massas) e Proust (proporções fixas).',
      },
      {
        title: '2. Constantes e Conversões de Ouro',
        type: 'formulas',
        content: 'Todo cálculo químico passa pela unidade central: o MOL.',
        latex: '1 \\text{ mol} = 6{,}02 \\times 10^{23} \\text{ partículas} = M \\text{ gramas} = 22{,}4 \\text{ L (nas CNTP)}',
        items: [
          'Número de mols: n = m / M (massa dada sobre massa molar da tabela periódica).',
          'CNTP (0 °C e 1 atm): 1 mol de qualquer gás ideal ocupa 22,4 Litros.',
          'Massa molar da água (H2O): H=1×2, O=16 → 18 g/mol.',
          'Massa molar do gás carbônico (CO2): C=12, O=16×2 → 44 g/mol.',
        ],
      },
      {
        title: '3. Método dos 4 Passos Infalíveis',
        type: 'step_by_step',
        content: 'Siga rigorosamente esta ordem para nunca errar:',
        items: [
          'Passo 1: Escreva e BALANCEIE a equação química.',
          'Passo 2: Destaque as substâncias envolvidas na pergunta.',
          'Passo 3: Monte a linha de proporção estequiométrica (mols, gramas ou litros).',
          'Passo 4: Monte a linha dos dados do problema com a incógnita X e multiplique em cruz.',
        ],
      },
    ],
    commonMistakes: [
      {
        title: 'Esquecer de balancear a equação',
        mistake: 'Fazer a regra de três com coeficientes estequiométricos incorretos.',
        correction: 'O balanceamento acerta a proporção atômica real. Sempre confira se o número de átomos de cada elemento é igual antes e depois da seta.',
      },
      {
        title: 'Misturar unidades na mesma coluna',
        mistake: 'Colocar gramas em cima e litros embaixo na mesma coluna da proporção.',
        correction: 'A mesma grandeza e unidade deve ser mantida na respectiva coluna (Massa com Massa, Litros com Litros, Mols com Mols).',
      },
    ],
    quickSummary: [
      'Passo zero: Balancear a equação química.',
      '1 mol = Massa Molar (g) = 22,4 L (CNTP) = 6,02 × 10²³ moléculas.',
      'Massa total dos reagentes = Massa total dos produtos (Lavoisier).',
      'Reagente limitante é aquele que é consumido primeiro e limita a quantidade máxima de produto gerado.',
    ],
    sampleQuestion: {
      prompt: 'Qual a massa de água (H2O, M = 18 g/mol) produzida na queima completa de 4 g de gás hidrogênio (H2, M = 2 g/mol) com O2 suficiente?',
      solutionSteps: [
        'Equação balanceada: 2 H2 + O2 → 2 H2O',
        'Proporção: 2 mols de H2 (2 × 2 g = 4 g) produzem 2 mols de H2O (2 × 18 g = 36 g).',
        'Como foram queimados exatamente 4 g de H2, a massa de água formada é 36 g.',
      ],
      answer: '36 g de H2O',
    },
    quizQuestionIds: ['qui_esteq_tpl_1', 'qui_geral_1', 'qui_geral_2', 'qui_geral_3', 'qui_geral_4'],
  },
];

export const STUDY_GUIDES: StudyGuide[] = [...CORE_STUDY_GUIDES, ...EXPANDED_STUDY_GUIDES];

/**
 * Get Study Guide by ID or topicId
 */
export function getStudyGuideByIdOrTopic(guideOrTopicId: string): StudyGuide | undefined {
  return STUDY_GUIDES.find(
    (g) => g.id === guideOrTopicId || g.topicId === guideOrTopicId
  );
}

/**
 * Get Study Guides filtered by subject
 */
export function getStudyGuidesBySubject(subjectId: SubjectId): StudyGuide[] {
  return STUDY_GUIDES.filter((g) => g.subjectId === subjectId);
}

/**
 * Search Study Guides by query string across title, subtitle, tags and content
 */
export function searchStudyGuides(query: string): StudyGuide[] {
  if (!query || !query.trim()) return STUDY_GUIDES;
  const clean = query.toLowerCase().trim();
  return STUDY_GUIDES.filter((g) => {
    return (
      g.title.toLowerCase().includes(clean) ||
      g.subtitle.toLowerCase().includes(clean) ||
      g.tags.some((t) => t.toLowerCase().includes(clean)) ||
      g.sections.some((s) => s.content.toLowerCase().includes(clean) || s.title.toLowerCase().includes(clean))
    );
  });
}
