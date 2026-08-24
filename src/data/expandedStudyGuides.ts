import type { StudyGuide, SubjectId } from '../types';

interface GuideBlueprint {
  id: string;
  subjectId: SubjectId;
  topicId: string;
  title: string;
  subtitle: string;
  concept: string;
  method: string[];
  essentials: string[];
  mistakes: Array<{ title: string; mistake: string; correction: string }>;
  sample: { prompt: string; steps: string[]; answer: string };
  tags: string[];
}

function buildGuide(blueprint: GuideBlueprint): StudyGuide {
  return {
    id: blueprint.id,
    subjectId: blueprint.subjectId,
    topicId: blueprint.topicId,
    title: blueprint.title,
    subtitle: blueprint.subtitle,
    estimatedReadMinutes: 5,
    tags: [...blueprint.tags, 'vestibular', 'revisao-rapida'],
    sections: [
      { title: '1. Visão de prova', type: 'concept', content: blueprint.concept },
      { title: '2. Método passo a passo', type: 'step_by_step', content: 'Use esta sequência para transformar teoria em decisão de prova:', items: blueprint.method },
      { title: '3. O que precisa estar na memória', type: 'summary', content: 'Pontos de alta recorrência:', items: blueprint.essentials },
    ],
    commonMistakes: blueprint.mistakes,
    quickSummary: blueprint.essentials.slice(0, 5),
    sampleQuestion: {
      prompt: blueprint.sample.prompt,
      solutionSteps: blueprint.sample.steps,
      answer: blueprint.sample.answer,
    },
  };
}

const BLUEPRINTS: GuideBlueprint[] = [
  {
    id: 'guide_interp_inferencia', subjectId: 'interpretacao', topicId: 'compreensao_interpretacao',
    title: 'Apostila Expressa: Inferência sem Extrapolação',
    subtitle: 'Descubra o implícito usando pistas verificáveis do texto.',
    concept: 'Questões de inferência exigem uma conclusão sustentada pelo texto. A resposta correta amplia o que foi dito sem contradizer, exagerar ou introduzir informação externa.',
    method: ['Leia o comando antes do texto e marque o verbo: infere-se, conclui-se ou depreende-se.', 'Localize as palavras que limitam a afirmação: alguns, pode, frequentemente, apenas.', 'Formule uma conclusão curta com suas palavras.', 'Elimine alternativas absolutas, externas ao texto ou parcialmente verdadeiras.'],
    essentials: ['Inferir não é copiar nem inventar.', 'Toda conclusão precisa de uma pista textual.', 'Palavras absolutas costumam distorcer argumentos moderados.', 'A alternativa correta preserva o alcance da tese.'],
    mistakes: [{ title: 'Usar opinião pessoal', mistake: 'Escolher a alternativa com que você concorda.', correction: 'Escolha a que pode ser provada pelo texto, mesmo que discorde dela.' }, { title: 'Extrapolar', mistake: 'Transformar “pode ocorrer” em “sempre ocorre”.', correction: 'Preserve os modalizadores e os limites da afirmação original.' }],
    sample: { prompt: 'Um autor afirma que “o acesso à informação pode ampliar a participação política, desde que haja educação midiática”. O que se infere?', steps: ['A tese é condicional.', 'Informação isolada não garante participação.', 'Educação midiática aparece como condição relevante.'], answer: 'O potencial democrático da informação depende também da capacidade crítica do público.' },
    tags: ['interpretacao', 'inferencia', 'enem'],
  },
  {
    id: 'guide_lit_realismo', subjectId: 'literatura', topicId: 'realismo_naturalismo',
    title: 'Apostila Expressa: Realismo, Naturalismo e Machado',
    subtitle: 'Compare escolas literárias e reconheça marcas estilísticas.',
    concept: 'O Realismo reage à idealização romântica com análise psicológica e crítica social. O Naturalismo radicaliza o olhar científico, enfatizando determinismo, ambiente e hereditariedade.',
    method: ['Identifique como o narrador trata as personagens: idealização ou análise crítica.', 'Procure ironia, contradições e interesses sociais.', 'No Naturalismo, observe animalização, coletividade e determinismo.', 'Relacione forma narrativa ao contexto do fim do século XIX.'],
    essentials: ['Machado explora ironia e narradores pouco confiáveis.', 'Realismo prioriza crítica social e psicológica.', 'Naturalismo enfatiza determinismo biológico e social.', 'Parnasianismo valoriza rigor formal e descrição.'],
    mistakes: [{ title: 'Narrador = autor', mistake: 'Tomar toda fala do narrador como opinião de Machado.', correction: 'Analise a confiabilidade do narrador e suas contradições.' }, { title: 'Confundir escolas', mistake: 'Tratar Naturalismo como simples sinônimo de Realismo.', correction: 'O Naturalismo acentua determinismo e pretensão cientificista.' }],
    sample: { prompt: 'Por que a contradição de um narrador pode ser central em um romance machadiano?', steps: ['O narrador apresenta sua versão.', 'Ironias revelam lacunas e interesses.', 'O leitor precisa reconstruir criticamente os fatos.'], answer: 'Porque a instabilidade do narrador transforma o leitor em intérprete e sustenta a crítica às aparências sociais.' },
    tags: ['literatura', 'realismo', 'machado-de-assis'],
  },
  {
    id: 'guide_geo_cartografia', subjectId: 'geografia', topicId: 'cartografia_escalas',
    title: 'Apostila Expressa: Escalas, Projeções e Fusos',
    subtitle: 'Resolva cartografia com conversões seguras e leitura crítica.',
    concept: 'Escala relaciona a medida representada à medida real. Projeções transferem a superfície curva da Terra para o plano e, por isso, sempre produzem algum tipo de distorção.',
    method: ['Iguale as unidades antes de calcular.', 'Na escala 1:n, multiplique a distância do mapa por n para obter a real.', 'Converta centímetros para quilômetros dividindo por 100.000.', 'Em fusos, compare longitudes: para leste, horas adiantadas; para oeste, atrasadas.'],
    essentials: ['Escala grande: mais detalhes e área menor.', 'Escala pequena: menos detalhes e área maior.', 'Toda projeção distorce área, forma, distância ou direção.', '15° de longitude correspondem aproximadamente a uma hora.'],
    mistakes: [{ title: 'Inverter a escala', mistake: 'Afirmar que 1:1.000.000 é maior que 1:10.000.', correction: 'Compare como frações: menor denominador significa escala maior.' }, { title: 'Misturar unidades', mistake: 'Converter diretamente cm do mapa em km sem fator correto.', correction: 'Faça a cadeia cm → m → km ou use 100.000 cm = 1 km.' }],
    sample: { prompt: 'Em um mapa 1:500.000, duas cidades estão separadas por 4 cm. Qual a distância real?', steps: ['4 × 500.000 = 2.000.000 cm.', '2.000.000 ÷ 100.000 = 20 km.'], answer: '20 km.' },
    tags: ['geografia', 'cartografia', 'escala'],
  },
  {
    id: 'guide_ing_reading', subjectId: 'ingles', topicId: 'skimming_scanning',
    title: 'Apostila Expressa: Reading para Vestibulares',
    subtitle: 'Skimming, scanning, cognatos e referência textual.',
    concept: 'Provas de inglês avaliam principalmente leitura. Skimming capta tema e tese; scanning localiza dados específicos; a análise de conectivos revela a organização do argumento.',
    method: ['Leia título, fonte e primeira frase de cada parágrafo.', 'Circule nomes, datas e palavras repetidas.', 'Volte ao trecho indicado pela questão em vez de traduzir tudo.', 'Use conectivos e contexto para inferir vocabulário desconhecido.'],
    essentials: ['However indica contraste; therefore, conclusão.', 'Actually significa “na verdade”.', 'Pretend significa “fingir”.', 'Pronomes retomam antecedentes compatíveis em sentido e número.'],
    mistakes: [{ title: 'Traduzir palavra por palavra', mistake: 'Parar em cada termo desconhecido.', correction: 'Priorize relações, cognatos confiáveis e ideia global.' }, { title: 'Falso cognato', mistake: 'Traduzir “eventually” como eventualmente.', correction: '“Eventually” geralmente significa finalmente ou por fim.' }],
    sample: { prompt: 'Em “The plan was expensive. However, the council approved it”, qual relação “however” estabelece?', steps: ['A primeira frase cria uma expectativa de rejeição.', 'A segunda contraria essa expectativa.'], answer: 'Contraste ou ressalva.' },
    tags: ['ingles', 'reading', 'skimming', 'scanning'],
  },
  {
    id: 'guide_filo_contratualismo', subjectId: 'filosofia', topicId: 'filosofia_moderna_contratualismo',
    title: 'Apostila Expressa: Hobbes, Locke e Rousseau',
    subtitle: 'Compare os contratualistas sem decorar frases soltas.',
    concept: 'O contratualismo explica a autoridade política por um pacto, mas cada autor descreve de modo diferente a natureza humana, os direitos e os limites do governo.',
    method: ['Identifique a visão do estado de natureza.', 'Pergunte qual problema leva ao pacto.', 'Observe quais direitos são preservados ou transferidos.', 'Conclua qual forma de soberania é defendida.'],
    essentials: ['Hobbes: segurança e soberano forte.', 'Locke: direitos naturais, propriedade e governo limitado.', 'Rousseau: soberania popular e vontade geral.', 'Montesquieu: separação de poderes contra abusos.'],
    mistakes: [{ title: 'Igualar os três autores', mistake: 'Achar que todo contrato social leva ao absolutismo.', correction: 'Somente Hobbes justifica soberania muito ampla; Locke e Rousseau seguem outras direções.' }, { title: 'Vontade de todos', mistake: 'Confundir soma de interesses privados com vontade geral.', correction: 'Em Rousseau, vontade geral aponta ao interesse comum.' }],
    sample: { prompt: 'Qual autor admite resistência a um governo que viola direitos naturais?', steps: ['Direitos naturais incluem vida, liberdade e propriedade.', 'O governo existe para protegê-los.', 'Se os viola, perde legitimidade.'], answer: 'John Locke.' },
    tags: ['filosofia', 'contratualismo', 'politica'],
  },
  {
    id: 'guide_soc_classicos', subjectId: 'sociologia', topicId: 'sociologia_classica',
    title: 'Apostila Expressa: Durkheim, Marx e Weber',
    subtitle: 'Três lentes para interpretar sociedade, trabalho e poder.',
    concept: 'Os clássicos fundam perspectivas complementares: Durkheim estuda coesão e fatos sociais; Marx analisa conflito e produção; Weber investiga sentidos da ação e formas de dominação.',
    method: ['Procure o problema central do enunciado: ordem, conflito ou sentido.', 'Associe coerção e instituições a Durkheim.', 'Associe classe, exploração e modo de produção a Marx.', 'Associe ação social, racionalização e legitimidade a Weber.'],
    essentials: ['Fato social: exterior, coercitivo e geral.', 'Mais-valia: valor produzido e não apropriado pelo trabalhador.', 'Ação social orienta-se pelo comportamento de outros.', 'Dominação pode ser tradicional, carismática ou legal-racional.'],
    mistakes: [{ title: 'Misturar conceitos', mistake: 'Atribuir mais-valia a Weber.', correction: 'Mais-valia pertence à crítica da economia política de Marx.' }, { title: 'Coerção física apenas', mistake: 'Reduzir coerção social à violência.', correction: 'Normas também se impõem por educação, expectativas e sanções simbólicas.' }],
    sample: { prompt: 'Uma repartição organizada por regras impessoais e cargos técnicos exemplifica qual conceito?', steps: ['Há normas formais.', 'Os cargos independem da pessoa.', 'A legitimidade vem da legalidade.'], answer: 'Burocracia e dominação legal-racional em Weber.' },
    tags: ['sociologia', 'durkheim', 'marx', 'weber'],
  },
  {
    id: 'guide_redacao_intervencao', subjectId: 'redacao', topicId: 'proposta_intervencao_enem',
    title: 'Apostila Expressa: Intervenção Completa no ENEM',
    subtitle: 'Construa uma conclusão específica, viável e ligada à tese.',
    concept: 'A proposta de intervenção deve enfrentar o problema discutido, respeitar os direitos humanos e apresentar agente, ação, meio, finalidade e detalhamento.',
    method: ['Retome o problema e escolha sua causa prioritária.', 'Nomeie um agente específico e competente.', 'Use um verbo de ação concreto.', 'Explique meio de execução, finalidade e pelo menos um detalhamento.'],
    essentials: ['Agente: quem executa.', 'Ação: o que será feito.', 'Meio/modo: como será feito.', 'Finalidade: para qual resultado.', 'Detalhamento: informação que torna um elemento mais preciso.'],
    mistakes: [{ title: 'Agente genérico', mistake: 'Escrever apenas “o governo deve conscientizar”.', correction: 'Nomeie órgão, ação, canal, público e finalidade.' }, { title: 'Solução desconectada', mistake: 'Propor algo que não responde aos argumentos.', correction: 'Faça cada ação atacar uma causa discutida no desenvolvimento.' }],
    sample: { prompt: 'Tema: desinformação em saúde. Construa o núcleo de uma intervenção.', steps: ['Agente: Ministério da Saúde.', 'Ação: campanha permanente de verificação.', 'Meio: parcerias com escolas e plataformas.', 'Finalidade: reduzir circulação de boatos e orientar busca de fontes confiáveis.'], answer: 'Uma proposta completa articula os cinco elementos e retoma a causa debatida.' },
    tags: ['redacao', 'enem', 'competencia-5'],
  },
  {
    id: 'guide_atualidades_clima', subjectId: 'atualidades', topicId: 'meio_ambiente_clima',
    title: 'Apostila Expressa: Clima, Energia e Justiça Ambiental',
    subtitle: 'Repertório estável para interpretar notícias e questões contemporâneas.',
    concept: 'A crise climática envolve mitigação das emissões, adaptação aos impactos e justiça climática, pois riscos e custos são distribuídos de forma desigual.',
    method: ['Separe o fato atual do conceito estrutural.', 'Identifique atores, interesses e escalas local/global.', 'Diferencie mitigação de adaptação.', 'Avalie efeitos sociais, econômicos e ambientais da política apresentada.'],
    essentials: ['Mitigação reduz causas e emissões.', 'Adaptação reduz vulnerabilidades aos impactos.', 'Transição energética exige tecnologia, financiamento e justiça social.', 'Eventos extremos combinam ameaça natural e vulnerabilidade humana.'],
    mistakes: [{ title: 'Tempo x clima', mistake: 'Usar um dia frio para negar tendências climáticas.', correction: 'Tempo é condição momentânea; clima é padrão estatístico de longo prazo.' }, { title: 'Solução única', mistake: 'Tratar uma tecnologia como resposta total.', correction: 'Compare escala, custo, território, cadeia produtiva e efeitos distributivos.' }],
    sample: { prompt: 'Construir drenagem urbana contra enchentes é mitigação ou adaptação?', steps: ['A medida não reduz diretamente emissões.', 'Ela reduz danos de um impacto climático.'], answer: 'Adaptação climática.' },
    tags: ['atualidades', 'clima', 'energia', 'meio-ambiente'],
  },
  {
    id: 'guide_logica_negacoes', subjectId: 'raciocinio_logico', topicId: 'tabelas_verdade_equivalencias',
    title: 'Apostila Expressa: Negações e Leis de De Morgan',
    subtitle: 'Negue proposições compostas sem cair nas alternativas intuitivas.',
    concept: 'Negar uma proposição significa produzir outra com valor lógico oposto em todos os casos. Nas leis de De Morgan, o conectivo troca e cada parcela é negada.',
    method: ['Identifique o conectivo principal.', 'Troque E por OU ou OU por E.', 'Negue cada proposição simples.', 'Nos quantificadores, troque todo por existe pelo menos um que não.'],
    essentials: ['¬(P ∧ Q) ≡ ¬P ∨ ¬Q.', '¬(P ∨ Q) ≡ ¬P ∧ ¬Q.', 'Negação de todo: existe ao menos um que não.', 'Negação de existe: nenhum.'],
    mistakes: [{ title: 'Manter o conectivo', mistake: 'Negar P e Q como não P e não Q.', correction: 'A negação correta usa não P OU não Q.' }, { title: 'Contrário x contraditório', mistake: 'Negar “todos passaram” como “todos reprovaram”.', correction: 'Basta que pelo menos um não tenha passado.' }],
    sample: { prompt: 'Negue: “Ana estuda ou Bruno trabalha”.', steps: ['O conectivo principal é OU.', 'Troque OU por E.', 'Negue as duas parcelas.'], answer: 'Ana não estuda e Bruno não trabalha.' },
    tags: ['logica', 'de-morgan', 'proposicoes'],
  },
];

export const EXPANDED_STUDY_GUIDES: StudyGuide[] = BLUEPRINTS.map(buildGuide);
