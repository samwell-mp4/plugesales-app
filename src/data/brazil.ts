export interface Estado {
  sigla: string;
  nome: string;
  slug: string;
  regiao: string;
  capital: string;
  capital_slug: string;
  descricao_curta: string;
  descricao: string;
  economia: string;
  industria: string;
  populacao: string;
  pib: string;
}

export interface Cidade {
  nome: string;
  slug: string;
  estado: string;
  descricao: string;
  destaque: string;
  populacao: string;
}

export const estados: Estado[] = [
  {
    sigla: 'AC',
    nome: 'Acre',
    slug: 'ac',
    regiao: 'Norte',
    capital: 'Rio Branco',
    capital_slug: 'rio-branco',
    descricao_curta: 'O Acre é um estado estratégico na região Norte com crescimento no setor de serviços e comércio.',
    descricao: 'O mercado de disparo em massa no WhatsApp no Acre tem grande potencial de crescimento. Empresas acreanas que utilizam a API Oficial da Meta conseguem se destacar da concorrência, alcançando clientes em Rio Branco e em todos os municípios do estado. A adoção da WABA (WhatsApp Business API) ainda é baixa na região, o que representa uma oportunidade única para empresas que querem sair na frente. Com a Plug & Sales, você ativa sua estrutura de disparo em massa em até 24h, sem precisar de Business Manager próprio ou configurações técnicas complexas.',
    economia: 'O Acre tem economia baseada em serviços, comércio, extrativismo vegetal e indústria moveleira. A capital Rio Branco concentra a maior parte das atividades empresariais.',
    industria: 'Comércio varejista, serviços, extrativismo, indústria moveleira e turismo ecológico.',
    populacao: '830.000',
    pib: 'R$ 16 bilhões'
  },
  {
    sigla: 'AL',
    nome: 'Alagoas',
    slug: 'al',
    regiao: 'Nordeste',
    capital: 'Maceió',
    capital_slug: 'maceio',
    descricao_curta: 'Alagoas é um estado nordestino com forte potencial no setor de turismo e comércio.',
    descricao: 'Empresas alagoanas estão descobrindo o poder do disparo em massa no WhatsApp para alavancar vendas. Maceió, a capital, concentra um mercado consumidor de mais de 1 milhão de pessoas na região metropolitana. Com a API Oficial da Meta, sua empresa pode enviar milhares de mensagens personalizadas por dia sem risco de bloqueio. A Plug & Sales é a parceira ideal para negócios em Alagoas que buscam uma infraestrutura profissional de disparo, com templates multimídia, botões e relatórios detalhados.',
    economia: 'Turismo, comércio, serviços e indústria química e de alimentos são os pilares da economia alagoana.',
    industria: 'Turismo, comércio, indústria química, sucroalcooleira e alimentos.',
    populacao: '3.127.000',
    pib: 'R$ 62 bilhões'
  },
  {
    sigla: 'AM',
    nome: 'Amazonas',
    slug: 'am',
    regiao: 'Norte',
    capital: 'Manaus',
    capital_slug: 'manaus',
    descricao_curta: 'O Amazonas é o maior estado da região Norte, com forte polo industrial em Manaus.',
    descricao: 'Empresas no Amazonas têm no disparo em massa no WhatsApp uma ferramenta poderosa para alcançar clientes em Manaus e em todo o estado. A Zona Franca de Manaus atrai milhares de empresas que precisam de comunicação em escala com seus clientes e parceiros. A API Oficial da Meta, oferecida pela Plug & Sales, permite disparos seguros sem risco de bloqueio, com capacidade de milhares de mensagens por dia. Sua empresa no Amazonas merece uma infraestrutura de disparo profissional.',
    economia: 'A Zona Franca de Manaus é o principal polo econômico, com indústrias de eletroeletrônicos, duas rodas e química.',
    industria: 'Polo industrial de Manaus (eletroeletrônicos, duas rodas, química), extrativismo, turismo.',
    populacao: '3.941.000',
    pib: 'R$ 117 bilhões'
  },
  {
    sigla: 'AP',
    nome: 'Amapá',
    slug: 'ap',
    regiao: 'Norte',
    capital: 'Macapá',
    capital_slug: 'macapa',
    descricao_curta: 'O Amapá é um estado da região Norte com economia baseada em serviços e extrativismo.',
    descricao: 'O mercado digital no Amapá está em expansão, e o disparo em massa no WhatsApp é uma oportunidade real para empresas que querem crescer. Com a API Oficial da Meta, negócios em Macapá e em todo o estado podem enviar campanhas segmentadas com templates multimídia, botões de link e acompanhamento em tempo real. A Plug & Sales oferece a infraestrutura mais completa para disparo em massa na região Norte, com ativação rápida e suporte dedicado.',
    economia: 'Serviços públicos, comércio, extrativismo mineral e vegetal são as principais atividades econômicas.',
    industria: 'Serviços, comércio, extrativismo mineral (ouro, manganês) e madeira.',
    populacao: '845.000',
    pib: 'R$ 18 bilhões'
  },
  {
    sigla: 'BA',
    nome: 'Bahia',
    slug: 'ba',
    regiao: 'Nordeste',
    capital: 'Salvador',
    capital_slug: 'salvador',
    descricao_curta: 'A Bahia é o maior estado do Nordeste, com economia diversificada e forte mercado consumidor.',
    descricao: 'Empresas baianas estão na vanguarda do disparo em massa no WhatsApp na região Nordeste. Salvador, a capital, é um dos maiores mercados consumidores do Brasil, com mais de 3 milhões de habitantes na região metropolitana. A API Oficial da Meta permite que empresas de todos os segmentos — do comércio varejista à indústria — se comuniquem com milhares de clientes por dia de forma segura e profissional. A Plug & Sales é a escolha certa para negócios na Bahia que buscam escalar suas operações de marketing e vendas via WhatsApp.',
    economia: 'A Bahia tem a maior economia do Nordeste, com destaque para petroquímica, turismo, agronegócio e serviços.',
    industria: 'Petroquímica, turismo, agronegócio, indústria automotiva, alimentos e bebidas.',
    populacao: '14.141.000',
    pib: 'R$ 352 bilhões'
  },
  {
    sigla: 'CE',
    nome: 'Ceará',
    slug: 'ce',
    regiao: 'Nordeste',
    capital: 'Fortaleza',
    capital_slug: 'fortaleza',
    descricao_curta: 'O Ceará tem uma das economias mais dinâmicas do Nordeste, com forte presença digital.',
    descricao: 'O mercado de disparo em massa no WhatsApp no Ceará está aquecido. Fortaleza é um polo de inovação e tecnologia no Nordeste, com centenas de agências de marketing digital e empresas de tecnologia adotando a API Oficial da Meta. Com a Plug & Sales, empresas cearenses têm acesso a uma infraestrutura de disparo profissional, com templates multimídia, variáveis dinâmicas e relatórios em tempo real. Não importa se sua empresa está em Fortaleza, Juazeiro do Norte ou Sobral — você pode escalar suas comunicações sem risco de bloqueio.',
    economia: 'Turismo, comércio, serviços, indústria têxtil e calçadista, agronegócio e tecnologia da informação.',
    industria: 'Têxtil, calçadista, alimentos, turismo, tecnologia e comércio varejista.',
    populacao: '8.792.000',
    pib: 'R$ 182 bilhões'
  },
  {
    sigla: 'DF',
    nome: 'Distrito Federal',
    slug: 'df',
    regiao: 'Centro-Oeste',
    capital: 'Brasília',
    capital_slug: 'brasilia',
    descricao_curta: 'Brasília é o centro político do Brasil com a maior renda per capita do país.',
    descricao: 'Brasília e o Distrito Federal representam um mercado de alto poder aquisitivo para disparo em massa no WhatsApp. Com a maior renda per capita do Brasil, os consumidores brasilienses são extremamente receptivos a comunicações personalizadas via WhatsApp. Empresas no DF que utilizam a API Oficial da Meta através da Plug & Sales conseguem segmentar suas campanhas com precisão, enviando mensagens com templates multimídia e botões de link. Ative sua estrutura de disparo em massa em 24h e alcance os consumidores mais qualificados do país.',
    economia: 'Administração pública, serviços, comércio, tecnologia da informação e construção civil.',
    industria: 'Serviços governamentais, tecnologia, comércio, construção civil e comunicação.',
    populacao: '2.817.000',
    pib: 'R$ 286 bilhões'
  },
  {
    sigla: 'ES',
    nome: 'Espírito Santo',
    slug: 'es',
    regiao: 'Sudeste',
    capital: 'Vitória',
    capital_slug: 'vitoria',
    descricao_curta: 'O Espírito Santo é um estado estratégico no Sudeste com forte atividade portuária.',
    descricao: 'Empresas capixabas estão cada vez mais adotando o disparo em massa no WhatsApp como canal principal de comunicação. Vitória e a região metropolitana, incluindo Cariacica, Vila Velha e Serra, formam um mercado de mais de 2 milhões de pessoas. A API Oficial da Meta, oferecida pela Plug & Sales, permite que empresas de todos os portes enviem campanhas segmentadas com segurança total. Se sua empresa está no Espírito Santo, não perca a oportunidade de escalar suas vendas com a infraestrutura mais moderna de disparo do mercado.',
    economia: 'Portos, mineração, siderurgia, petróleo e gás, comércio e serviços são os pilares da economia capixaba.',
    industria: 'Mineração, siderurgia, petróleo e gás, portos, café e granito.',
    populacao: '3.885.000',
    pib: 'R$ 145 bilhões'
  },
  {
    sigla: 'GO',
    nome: 'Goiás',
    slug: 'go',
    regiao: 'Centro-Oeste',
    capital: 'Goiânia',
    capital_slug: 'goiania',
    descricao_curta: 'Goiás é um estado estratégico no Centro-Oeste com forte agronegócio e comércio.',
    descricao: 'Goiás é um mercado promissor para disparo em massa no WhatsApp. Goiânia, a capital, é um polo regional de comércio e serviços que atrai consumidores de todo o estado. Empresas goianas que adotam a API Oficial da Meta conseguem se comunicar com milhares de clientes por dia sem risco de bloqueio, usando templates com imagem, vídeo, áudio e botões. A Plug & Sales oferece a melhor infraestrutura de disparo em massa para Goiás, com ativação em 24h e planos a partir de R$ 97.',
    economia: 'Agronegócio (soja, milho, pecuária), comércio, serviços e indústria alimentícia.',
    industria: 'Agronegócio, alimentos, comércio varejista, farmacêutico e logística.',
    populacao: '7.056.000',
    pib: 'R$ 226 bilhões'
  },
  {
    sigla: 'MA',
    nome: 'Maranhão',
    slug: 'ma',
    regiao: 'Nordeste',
    capital: 'São Luís',
    capital_slug: 'sao-luis',
    descricao_curta: 'O Maranhão é um estado nordestino com crescente digitalização do comércio.',
    descricao: 'O Maranhão está vivendo um momento de transformação digital, e o disparo em massa no WhatsApp é uma ferramenta essencial para empresas que querem crescer. São Luís, a capital, concentra o maior mercado consumidor do estado, com mais de 1 milhão de habitantes. Com a API Oficial da Meta, empresas maranhenses podem enviar campanhas personalizadas sem violar os Termos de Serviço do WhatsApp. A Plug & Sales é a parceira ideal para negócios no Maranhão que buscam uma solução profissional de disparo em massa.',
    economia: 'Serviços, comércio, indústria, agronegócio e o Porto do Itaqui são motores econômicos.',
    industria: 'Alimentos, alumínio, celulose, turismo e logística portuária.',
    populacao: '7.153.000',
    pib: 'R$ 106 bilhões'
  },
  {
    sigla: 'MG',
    nome: 'Minas Gerais',
    slug: 'mg',
    regiao: 'Sudeste',
    capital: 'Belo Horizonte',
    capital_slug: 'belo-horizonte',
    descricao_curta: 'Minas Gerais é o segundo estado mais populoso do Sudeste com economia diversificada.',
    descricao: 'Minas Gerais é um dos mercados mais promissores para disparo em massa no WhatsApp no Brasil. Belo Horizonte, a capital, é um polo de inovação e tecnologia com centenas de startups e agências digitais. Empresas mineiras de todos os portes estão adotando a API Oficial da Meta para escalar suas comunicações, desde o comércio varejista em Contagem e Uberlândia até a indústria em Juiz de Fora e Montes Claros. A Plug & Sales oferece a infraestrutura mais robusta de disparo em massa para Minas Gerais, com templates multimídia, botões personalizados e relatórios em tempo real. Ative sua estrutura em 24h e comece a disparar sem risco de bloqueio.',
    economia: 'Mineração, siderurgia, agronegócio, indústria automotiva, tecnologia e comércio.',
    industria: 'Mineração, siderurgia, automotiva, alimentos, bebidas, tecnologia e moda.',
    populacao: '20.539.000',
    pib: 'R$ 807 bilhões'
  },
  {
    sigla: 'MS',
    nome: 'Mato Grosso do Sul',
    slug: 'ms',
    regiao: 'Centro-Oeste',
    capital: 'Campo Grande',
    capital_slug: 'campo-grande',
    descricao_curta: 'Mato Grosso do Sul é referência no agronegócio e tem mercado digital crescente.',
    descricao: 'O disparo em massa no WhatsApp é uma ferramenta cada vez mais utilizada por empresas sul-mato-grossenses. Campo Grande, a capital, é um centro regional de comércio e serviços que atende todo o estado. A API Oficial da Meta permite que empresas de Mato Grosso do Sul enviem mensagens em escala com total segurança, sem risco de bloqueio. Com a Plug & Sales, sua empresa em Campo Grande, Dourados ou Três Lagoas pode ativar uma estrutura profissional de disparo em até 24h.',
    economia: 'Agronegócio (soja, milho, pecuária), indústria de celulose, comércio e serviços.',
    industria: 'Agronegócio, celulose, alimentos, frigoríficos e logística.',
    populacao: '2.757.000',
    pib: 'R$ 127 bilhões'
  },
  {
    sigla: 'MT',
    nome: 'Mato Grosso',
    slug: 'mt',
    regiao: 'Centro-Oeste',
    capital: 'Cuiabá',
    capital_slug: 'cuiaba',
    descricao_curta: 'Mato Grosso é líder do agronegócio brasileiro com economia em expansão.',
    descricao: 'Empresas mato-grossenses estão descobrindo o poder do disparo em massa no WhatsApp para alavancar vendas e comunicação. Cuiabá, a capital, é o centro econômico do estado, com um mercado consumidor em crescimento. A API Oficial da Meta, oferecida pela Plug & Sales, permite disparar milhares de mensagens personalizadas por dia sem risco de bloqueio. Sua empresa em Mato Grosso merece uma infraestrutura de disparo profissional, com templates multimídia e relatórios detalhados.',
    economia: 'Agronegócio (soja, milho, algodão, pecuária) é a base da economia mato-grossense, a mais forte do Centro-Oeste.',
    industria: 'Agronegócio, alimentos, biocombustíveis, algodão e madeira.',
    populacao: '3.658.000',
    pib: 'R$ 218 bilhões'
  },
  {
    sigla: 'PA',
    nome: 'Pará',
    slug: 'pa',
    regiao: 'Norte',
    capital: 'Belém',
    capital_slug: 'belem',
    descricao_curta: 'O Pará é o maior estado da região Norte em população e economia.',
    descricao: 'O mercado paraense está cada vez mais digital, e o disparo em massa no WhatsApp é uma oportunidade real para empresas de todos os segmentos. Belém, a capital, é um dos maiores mercados consumidores da região Norte, com mais de 1,4 milhão de habitantes na região metropolitana. A API Oficial da Meta permite que empresas paraenses enviem campanhas segmentadas com segurança total. A Plug & Sales oferece a melhor infraestrutura de disparo em massa para o Pará, com ativação rápida e suporte dedicado.',
    economia: 'Extrativismo mineral (ferro, bauxita, ouro), agronegócio, comércio e serviços.',
    industria: 'Mineração, siderurgia, alumínio, alimentos, madeira e turismo.',
    populacao: '8.121.000',
    pib: 'R$ 188 bilhões'
  },
  {
    sigla: 'PB',
    nome: 'Paraíba',
    slug: 'pb',
    regiao: 'Nordeste',
    capital: 'João Pessoa',
    capital_slug: 'joao-pessoa',
    descricao_curta: 'A Paraíba tem economia diversificada e mercado digital em expansão.',
    descricao: 'Empresas paraibanas estão adotando o disparo em massa no WhatsApp como canal estratégico de vendas. João Pessoa, a capital, é uma das cidades que mais crescem no Nordeste, com um mercado consumidor de alto potencial. Com a API Oficial da Meta, sua empresa na Paraíba pode enviar mensagens em massa sem risco de bloqueio, utilizando templates profissionais com imagem, vídeo e botões. A Plug & Sales é a parceira ideal para negócios na Paraíba que buscam uma solução completa de disparo.',
    economia: 'Comércio, serviços, turismo, indústria têxtil e calçadista, tecnologia da informação.',
    industria: 'Têxtil, calçados, alimentos, turismo e tecnologia.',
    populacao: '3.974.000',
    pib: 'R$ 72 bilhões'
  },
  {
    sigla: 'PE',
    nome: 'Pernambuco',
    slug: 'pe',
    regiao: 'Nordeste',
    capital: 'Recife',
    capital_slug: 'recife',
    descricao_curta: 'Pernambuco é um dos estados mais inovadores do Nordeste, com forte polo tecnológico.',
    descricao: 'Pernambuco é um dos mercados mais promissores para disparo em massa no WhatsApp no Nordeste. Recife, a capital, abriga o Porto Digital, um dos maiores parques tecnológicos do Brasil, com centenas de empresas de tecnologia e marketing digital. A API Oficial da Meta permite que empresas pernambucanas escalem suas comunicações com segurança total, alcançando milhares de clientes por dia. A Plug & Sales oferece a infraestrutura ideal para negócios em Pernambuco, com ativação em 24h e planos a partir de R$ 97.',
    economia: 'Serviços, tecnologia, turismo, comércio, indústria têxtil e alimentícia, agronegócio.',
    industria: 'Tecnologia (Porto Digital), têxtil, alimentos, turismo, saúde e logística.',
    populacao: '9.058.000',
    pib: 'R$ 221 bilhões'
  },
  {
    sigla: 'PI',
    nome: 'Piauí',
    slug: 'pi',
    regiao: 'Nordeste',
    capital: 'Teresina',
    capital_slug: 'teresina',
    descricao_curta: 'O Piauí tem economia em crescimento e mercado digital emergente.',
    descricao: 'O Piauí é um mercado emergente para disparo em massa no WhatsApp. Teresina, a capital, é um polo regional de comércio e serviços que atende consumidores de todo o estado. Empresas piauienses que adotam a API Oficial da Meta conseguem se destacar da concorrência, oferecendo comunicação profissional e segura. Com a Plug & Sales, sua empresa no Piauí pode ativar uma estrutura completa de disparo em até 24h, sem precisar de configurações técnicas complexas.',
    economia: 'Comércio, serviços, agronegócio e indústria de alimentos são os principais setores.',
    industria: 'Alimentos, comércio, serviços, agronegócio e confecções.',
    populacao: '3.270.000',
    pib: 'R$ 56 bilhões'
  },
  {
    sigla: 'PR',
    nome: 'Paraná',
    slug: 'pr',
    regiao: 'Sul',
    capital: 'Curitiba',
    capital_slug: 'curitiba',
    descricao_curta: 'O Paraná é um dos estados mais industrializados do Sul com economia forte.',
    descricao: 'O Paraná é um mercado estratégico para disparo em massa no WhatsApp. Curitiba, a capital, é reconhecida como uma das cidades mais inovadoras do Brasil, com um ecossistema vibrante de startups e agências digitais. Empresas paranaenses de todos os portes — de Londrina a Maringá, de Foz do Iguaçu a Ponta Grossa — estão adotando a API Oficial da Meta para escalar comunicações. A Plug & Sales oferece a infraestrutura mais completa de disparo em massa para o Paraná, com templates multimídia, botões de link e relatórios em tempo real.',
    economia: 'Agronegócio, indústria automotiva, tecnologia, serviços e comércio são pilares paranaenses.',
    industria: 'Automotiva, agronegócio, tecnologia, alimentos, madeira e móveis.',
    populacao: '11.444.000',
    pib: 'R$ 540 bilhões'
  },
  {
    sigla: 'RJ',
    nome: 'Rio de Janeiro',
    slug: 'rj',
    regiao: 'Sudeste',
    capital: 'Rio de Janeiro',
    capital_slug: 'rio-de-janeiro',
    descricao_curta: 'O Rio de Janeiro é o terceiro maior mercado do Brasil, com economia diversificada.',
    descricao: 'O Rio de Janeiro é um dos mercados mais importantes para disparo em massa no WhatsApp no Brasil. A capital fluminense é o segundo maior mercado consumidor do país, com mais de 6 milhões de habitantes na cidade e 12 milhões na região metropolitana. Empresas cariocas e fluminenses de todos os segmentos — do comércio varejista em Niterói e Duque de Caxias ao setor de serviços no Rio — estão adotando a API Oficial da Meta para escalar suas comunicações. A Plug & Sales é a escolha certa para negócios no Rio de Janeiro que buscam uma infraestrutura de disparo profissional, segura e sem risco de bloqueio.',
    economia: 'Petróleo e gás, turismo, comércio, serviços, indústria e entretenimento são os motores econômicos.',
    industria: 'Petróleo e gás, turismo, entretenimento, comércio, serviços e construção naval.',
    populacao: '16.055.000',
    pib: 'R$ 780 bilhões'
  },
  {
    sigla: 'RN',
    nome: 'Rio Grande do Norte',
    slug: 'rn',
    regiao: 'Nordeste',
    capital: 'Natal',
    capital_slug: 'natal',
    descricao_curta: 'O Rio Grande do Norte tem economia baseada em turismo, comércio e serviços.',
    descricao: 'Empresas potiguares estão cada vez mais utilizando o disparo em massa no WhatsApp para impulsionar vendas. Natal, a capital, é um polo turístico e comercial que atrai consumidores de todo o estado. A API Oficial da Meta permite que empresas do Rio Grande do Norte enviem mensagens em escala com total segurança, sem risco de bloqueio. Com a Plug & Sales, sua empresa em Natal, Mossoró ou Parnamirim pode ativar uma estrutura profissional de disparo em até 24h.',
    economia: 'Turismo, comércio, serviços, indústria têxtil, fruticultura e petróleo.',
    industria: 'Turismo, têxtil, fruticultura, petróleo e gás, sal marinho.',
    populacao: '3.507.000',
    pib: 'R$ 78 bilhões'
  },
  {
    sigla: 'RO',
    nome: 'Rondônia',
    slug: 'ro',
    regiao: 'Norte',
    capital: 'Porto Velho',
    capital_slug: 'porto-velho',
    descricao_curta: 'Rondônia é um estado da região Norte com economia baseada no agronegócio.',
    descricao: 'O mercado digital em Rondônia está em expansão, e o disparo em massa no WhatsApp é uma oportunidade real para empresas que querem crescer. Porto Velho, a capital, concentra a maior parte das atividades comerciais do estado. A API Oficial da Meta, oferecida pela Plug & Sales, permite disparar milhares de mensagens personalizadas por dia sem risco de bloqueio. Sua empresa em Rondônia merece uma infraestrutura de disparo profissional e segura.',
    economia: 'Agronegócio (soja, milho, pecuária), extrativismo vegetal e mineral, comércio e serviços.',
    industria: 'Agronegócio, alimentos, madeira, mineração e comércio.',
    populacao: '1.616.000',
    pib: 'R$ 53 bilhões'
  },
  {
    sigla: 'RR',
    nome: 'Roraima',
    slug: 'rr',
    regiao: 'Norte',
    capital: 'Boa Vista',
    capital_slug: 'boa-vista',
    descricao_curta: 'Roraima é o estado menos populoso do Brasil, com economia baseada em serviços.',
    descricao: 'Empresas em Roraima estão descobrindo o potencial do disparo em massa no WhatsApp para alcançar clientes em Boa Vista e em todo o estado. A API Oficial da Meta permite comunicação profissional em escala, sem violar os Termos de Serviço do WhatsApp. Com a Plug & Sales, sua empresa em Roraima pode ativar uma estrutura completa de disparo em até 24h, com templates multimídia e suporte dedicado.',
    economia: 'Serviços públicos, comércio, extrativismo vegetal e mineral, agropecuária.',
    industria: 'Serviços, comércio, extrativismo, agropecuária e alimentos.',
    populacao: '636.000',
    pib: 'R$ 17 bilhões'
  },
  {
    sigla: 'RS',
    nome: 'Rio Grande do Sul',
    slug: 'rs',
    regiao: 'Sul',
    capital: 'Porto Alegre',
    capital_slug: 'porto-alegre',
    descricao_curta: 'O Rio Grande do Sul é um dos estados mais industrializados do Brasil.',
    descricao: 'O Rio Grande do Sul é um mercado maduro e sofisticado para disparo em massa no WhatsApp. Porto Alegre, a capital, é um centro regional de tecnologia e inovação, com centenas de agências de marketing digital e empresas de tecnologia adotando a API Oficial da Meta. Empresas gaúchas de todos os portes — de Caxias do Sul a Pelotas, de Passo Fundo a Santa Maria — estão escalando suas comunicações com segurança. A Plug & Sales oferece a melhor infraestrutura de disparo em massa para o Rio Grande do Sul, com ativação rápida e planos a partir de R$ 97.',
    economia: 'Agronegócio, indústria automotiva, calçadista, química, tecnologia e serviços.',
    industria: 'Automotiva, calçados, química, alimentos, tecnologia, móveis e metalurgia.',
    populacao: '10.882.000',
    pib: 'R$ 528 bilhões'
  },
  {
    sigla: 'SC',
    nome: 'Santa Catarina',
    slug: 'sc',
    regiao: 'Sul',
    capital: 'Florianópolis',
    capital_slug: 'florianopolis',
    descricao_curta: 'Santa Catarina é referência nacional em tecnologia, inovação e qualidade de vida.',
    descricao: 'Santa Catarina é um dos mercados mais promissores para disparo em massa no WhatsApp no Sul do Brasil. Florianópolis, a capital, é reconhecida como um dos maiores polos de tecnologia do país, com centenas de startups e empresas de inovação. Joinville, a maior cidade do estado, é um polo industrial estratégico. Empresas catarinenses que adotam a API Oficial da Meta conseguem se comunicar com milhares de clientes por dia sem risco de bloqueio. A Plug & Sales oferece a infraestrutura ideal para negócios em Santa Catarina.',
    economia: 'Tecnologia, indústria têxtil, metalmecânica, agronegócio, turismo e comércio.',
    industria: 'Tecnologia, têxtil, metalmecânica, alimentos, móveis, cerâmica e turismo.',
    populacao: '7.610.000',
    pib: 'R$ 424 bilhões'
  },
  {
    sigla: 'SE',
    nome: 'Sergipe',
    slug: 'se',
    regiao: 'Nordeste',
    capital: 'Aracaju',
    capital_slug: 'aracaju',
    descricao_curta: 'Sergipe é o menor estado do Nordeste, mas com economia digital crescente.',
    descricao: 'Empresas sergipanas estão adotando o disparo em massa no WhatsApp como canal estratégico de vendas. Aracaju, a capital, concentra o maior mercado consumidor do estado, com mais de 600 mil habitantes. A API Oficial da Meta permite comunicação profissional em escala, com templates multimídia e botões personalizados. A Plug & Sales é a parceira ideal para negócios em Sergipe que buscam uma solução completa de disparo, com ativação em 24h e suporte dedicado.',
    economia: 'Comércio, serviços, turismo, indústria alimentícia e petróleo.',
    industria: 'Alimentos, turismo, petróleo, têxtil e comércio.',
    populacao: '2.210.000',
    pib: 'R$ 48 bilhões'
  },
  {
    sigla: 'SP',
    nome: 'São Paulo',
    slug: 'sp',
    regiao: 'Sudeste',
    capital: 'São Paulo',
    capital_slug: 'sao-paulo',
    descricao_curta: 'São Paulo é o maior mercado do Brasil, responsável por cerca de 30% do PIB nacional.',
    descricao: 'São Paulo é o maior e mais estratégico mercado para disparo em massa no WhatsApp no Brasil. A capital paulista é o maior centro econômico da América Latina, com mais de 12 milhões de habitantes na cidade e 21 milhões na região metropolitana. Empresas paulistas de todos os segmentos — do comércio varejista na capital à indústria no interior — estão adotando a API Oficial da Meta para escalar comunicações. Campinas, Guarulhos, Ribeirão Preto, São José dos Campos e Sorocaba são polos regionais estratégicos. A Plug & Sales oferece a infraestrutura mais robusta de disparo em massa para São Paulo, com capacidade de processar milhões de mensagens por dia, templates multimídia ilimitados e relatórios em tempo real. Sua empresa em São Paulo merece a melhor solução de disparo do mercado.',
    economia: 'A maior economia do Brasil: indústria diversificada, serviços financeiros, tecnologia, comércio, agronegócio no interior.',
    industria: 'Automotiva, tecnologia, financeiro, comércio, alimentos, química, aviação, agronegócio.',
    populacao: '44.411.000',
    pib: 'R$ 2,7 trilhões'
  },
  {
    sigla: 'TO',
    nome: 'Tocantins',
    slug: 'to',
    regiao: 'Norte',
    capital: 'Palmas',
    capital_slug: 'palmas',
    descricao_curta: 'Tocantins é o estado mais novo do Brasil, com economia baseada no agronegócio.',
    descricao: 'O mercado digital em Tocantins está em franca expansão. Palmas, a capital planejada, é um centro regional de comércio e serviços. Empresas tocantinenses que adotam o disparo em massa no WhatsApp via API Oficial da Meta conseguem se destacar da concorrência, alcançando clientes em todo o estado com comunicação profissional e segura. A Plug & Sales oferece a infraestrutura ideal para negócios em Tocantins, com ativação em 24h e planos a partir de R$ 97.',
    economia: 'Agronegócio (soja, pecuária), comércio, serviços e turismo ecológico.',
    industria: 'Agronegócio, alimentos, comércio, turismo e construção civil.',
    populacao: '1.511.000',
    pib: 'R$ 43 bilhões'
  }
];

export const cidades: Cidade[] = [
  {
    nome: 'Aracaju',
    slug: 'aracaju',
    estado: 'SE',
    descricao: 'Aracaju é a capital de Sergipe e o principal centro econômico do estado. Com mais de 600 mil habitantes, a cidade tem um mercado consumidor qualificado e crescente. Empresas em Aracaju que utilizam disparo em massa no WhatsApp via API Oficial conseguem se destacar da concorrência local, alcançando clientes com mensagens personalizadas e seguras.',
    destaque: 'Capital com melhor qualidade de vida do Nordeste, mercado consumidor de alto potencial.',
    populacao: '602.000'
  },
  {
    nome: 'Belém',
    slug: 'belem',
    estado: 'PA',
    descricao: 'Belém é a capital do Pará e o maior centro econômico da região Norte. Com mais de 1,4 milhão de habitantes na cidade e 2,2 milhões na região metropolitana, é um mercado estratégico para disparo em massa no WhatsApp. Empresas em Belém que adotam a API Oficial da Meta conseguem comunicar com milhares de clientes por dia sem risco de bloqueio.',
    destaque: 'Maior mercado da região Norte, hub de logística e comércio.',
    populacao: '1.492.000'
  },
  {
    nome: 'Belo Horizonte',
    slug: 'belo-horizonte',
    estado: 'MG',
    descricao: 'Belo Horizonte é a capital de Minas Gerais e o terceiro maior mercado do Sudeste. Com mais de 2,5 milhões de habitantes na cidade e 5 milhões na região metropolitana, BH é um polo de inovação e tecnologia. Empresas belo-horizontinas que utilizam disparo em massa no WhatsApp via API Oficial escalam suas operações com segurança total. A Plug & Sales está estrategicamente posicionada para atender negócios em Belo Horizonte com infraestrutura de disparo de alto nível.',
    destaque: 'Capital mineira, polo de tecnologia e inovação, 3º maior mercado do Sudeste.',
    populacao: '2.521.000'
  },
  {
    nome: 'Boa Vista',
    slug: 'boa-vista',
    estado: 'RR',
    descricao: 'Boa Vista é a capital de Roraima e a única capital da região Norte totalmente planejada. Com mais de 400 mil habitantes, a cidade é o centro econômico do estado. Empresas em Boa Vista que utilizam disparo em massa no WhatsApp via API Oficial conseguem se destacar e alcançar clientes em todo o estado de Roraima.',
    destaque: 'Última fronteira econômica do Brasil, mercado com alto potencial de crescimento.',
    populacao: '419.000'
  },
  {
    nome: 'Brasília',
    slug: 'brasilia',
    estado: 'DF',
    descricao: 'Brasília é a capital federal e o centro político do Brasil. Com a maior renda per capita do país e mais de 2,8 milhões de habitantes no Distrito Federal, Brasília representa um mercado de alto poder aquisitivo para disparo em massa no WhatsApp. Empresas brasilienses que adotam a API Oficial da Meta alcançam um dos públicos mais qualificados do Brasil. A Plug & Sales oferece infraestrutura de disparo premium para o Distrito Federal.',
    destaque: 'Maior renda per capita do Brasil, mercado qualificado de 2,8 milhões de pessoas.',
    populacao: '2.817.000'
  },
  {
    nome: 'Campinas',
    slug: 'campinas',
    estado: 'SP',
    descricao: 'Campinas é a terceira maior cidade de São Paulo e um dos principais polos tecnológicos e industriais do Brasil. Com mais de 1,2 milhão de habitantes, a cidade abriga centenas de empresas de tecnologia, universidades e centros de pesquisa. Empresas campineiras que utilizam disparo em massa no WhatsApp via API Oficial estão na vanguarda da comunicação digital.',
    destaque: 'Maior polo tecnológico do interior do Brasil, terceira maior cidade de SP.',
    populacao: '1.223.000'
  },
  {
    nome: 'Campo Grande',
    slug: 'campo-grande',
    estado: 'MS',
    descricao: 'Campo Grande é a capital de Mato Grosso do Sul e o principal centro econômico do estado. Com mais de 900 mil habitantes, a cidade é um polo regional de comércio e serviços. Empresas campo-grandenses que adotam o disparo em massa no WhatsApp via API Oficial da Meta conseguem escalar suas comunicações com segurança total.',
    destaque: 'Capital de MS, centro regional de comércio e serviços do Centro-Oeste.',
    populacao: '906.000'
  },
  {
    nome: 'Cariacica',
    slug: 'cariacica',
    estado: 'ES',
    descricao: 'Cariacica é um dos principais municípios da região metropolitana de Vitória, no Espírito Santo. Com mais de 380 mil habitantes, a cidade é um polo industrial e comercial estratégico. Empresas em Cariacica que utilizam disparo em massa no WhatsApp conseguem alcançar clientes em toda a Grande Vitória com comunicação profissional.',
    destaque: 'Importante polo industrial e comercial da Grande Vitória.',
    populacao: '384.000'
  },
  {
    nome: 'Contagem',
    slug: 'contagem',
    estado: 'MG',
    descricao: 'Contagem é a segunda maior cidade da região metropolitana de Belo Horizonte e um importante polo industrial de Minas Gerais. Com mais de 670 mil habitantes, a cidade abriga milhares de indústrias e comércios. Empresas em Contagem que utilizam disparo em massa no WhatsApp via API Oficial escalam sua comunicação B2B e B2C.',
    destaque: 'Segundo maior polo industrial de Minas Gerais, 670 mil habitantes.',
    populacao: '673.000'
  },
  {
    nome: 'Cuiabá',
    slug: 'cuiaba',
    estado: 'MT',
    descricao: 'Cuiabá é a capital de Mato Grosso e o centro econômico do estado. Com mais de 650 mil habitantes, a cidade é a porta de entrada para o agronegócio mato-grossense. Empresas cuiabanas que adotam o disparo em massa no WhatsApp via API Oficial conseguem se comunicar com milhares de clientes por dia com segurança.',
    destaque: 'Capital do agronegócio brasileiro, centro estratégico do Centro-Oeste.',
    populacao: '651.000'
  },
  {
    nome: 'Curitiba',
    slug: 'curitiba',
    estado: 'PR',
    descricao: 'Curitiba é a capital do Paraná e referência nacional em inovação e qualidade de vida. Com mais de 1,9 milhão de habitantes na cidade e 3,5 milhões na região metropolitana, Curitiba é um polo de tecnologia e serviços. Empresas curitibanas que utilizam disparo em massa no WhatsApp via API Oficial estão na vanguarda da comunicação digital no Sul do Brasil.',
    destaque: 'Capital da inovação, polo tecnológico, 1,9 milhão de habitantes.',
    populacao: '1.949.000'
  },
  {
    nome: 'Duque de Caxias',
    slug: 'duque-de-caxias',
    estado: 'RJ',
    descricao: 'Duque de Caxias é a terceira maior cidade do estado do Rio de Janeiro e um importante polo industrial da Baixada Fluminense. Com mais de 920 mil habitantes, a cidade abriga indústrias petroquímicas e metalúrgicas. Empresas em Duque de Caxias que utilizam disparo em massa no WhatsApp escalam sua comunicação com segurança.',
    destaque: 'Maior polo industrial da Baixada Fluminense, 920 mil habitantes.',
    populacao: '924.000'
  },
  {
    nome: 'Feira de Santana',
    slug: 'feira-de-santana',
    estado: 'BA',
    descricao: 'Feira de Santana é a segunda maior cidade da Bahia e um importante entroncamento rodoviário do Nordeste. Com mais de 620 mil habitantes, a cidade é um polo de comércio e serviços. Empresas feirenses que adotam o disparo em massa no WhatsApp via API Oficial alcançam clientes em toda a região.',
    destaque: 'Segunda maior cidade da Bahia, principal entroncamento rodoviário do Nordeste.',
    populacao: '624.000'
  },
  {
    nome: 'Florianópolis',
    slug: 'florianopolis',
    estado: 'SC',
    descricao: 'Florianópolis é a capital de Santa Catarina e reconhecida como um dos maiores polos de tecnologia do Brasil. Com mais de 500 mil habitantes, a cidade abriga centenas de startups e empresas de inovação. Empresas em Florianópolis que utilizam disparo em massa no WhatsApp via API Oficial estão na vanguarda digital. A Plug & Sales é a parceira ideal para negócios catarinenses.',
    destaque: 'Capital da inovação, maior polo de tecnologia do Sul do Brasil.',
    populacao: '508.000'
  },
  {
    nome: 'Fortaleza',
    slug: 'fortaleza',
    estado: 'CE',
    descricao: 'Fortaleza é a capital do Ceará e a quarta maior cidade do Brasil em população. Com mais de 2,7 milhões de habitantes na cidade e 4 milhões na região metropolitana, Fortaleza é um gigantesco mercado consumidor. Empresas fortalezenses que utilizam disparo em massa no WhatsApp via API Oficial alcançam milhares de clientes por dia com segurança e profissionalismo.',
    destaque: '4ª maior cidade do Brasil, maior mercado do Norte/Nordeste.',
    populacao: '2.703.000'
  },
  {
    nome: 'Goiânia',
    slug: 'goiania',
    estado: 'GO',
    descricao: 'Goiânia é a capital de Goiás e o principal centro econômico do estado. Com mais de 1,5 milhão de habitantes na cidade e 2,5 milhões na região metropolitana, Goiânia é um polo regional de comércio, serviços e saúde. Empresas goianienses que utilizam disparo em massa no WhatsApp via API Oficial escalam suas comunicações com segurança total.',
    destaque: 'Capital de Goiás, polo regional de saúde e comércio do Centro-Oeste.',
    populacao: '1.556.000'
  },
  {
    nome: 'Guarulhos',
    slug: 'guarulhos',
    estado: 'SP',
    descricao: 'Guarulhos é a segunda maior cidade de São Paulo e um dos principais polos logísticos e industriais do Brasil. Com mais de 1,4 milhão de habitantes, a cidade abriga o maior aeroporto da América Latina. Empresas em Guarulhos que utilizam disparo em massa no WhatsApp via API Oficial alcançam milhões de consumidores na região metropolitana de São Paulo.',
    destaque: '2ª maior cidade de SP, maior aeroporto da América Latina, 1,4 milhão de habitantes.',
    populacao: '1.404.000'
  },
  {
    nome: 'Jaboatão dos Guararapes',
    slug: 'jaboatao-dos-guararapes',
    estado: 'PE',
    descricao: 'Jaboatão dos Guararapes é a segunda maior cidade de Pernambuco e parte fundamental da região metropolitana do Recife. Com mais de 700 mil habitantes, a cidade tem forte presença industrial e comercial. Empresas em Jaboatão que utilizam disparo em massa no WhatsApp alcançam clientes em todo o Grande Recife.',
    destaque: '2ª maior cidade de PE, polo industrial e comercial do Grande Recife.',
    populacao: '706.000'
  },
  {
    nome: 'João Pessoa',
    slug: 'joao-pessoa',
    estado: 'PB',
    descricao: 'João Pessoa é a capital da Paraíba e uma das cidades que mais crescem no Nordeste. Com mais de 820 mil habitantes, a cidade tem um mercado consumidor em expansão. Empresas pessoenses que adotam o disparo em massa no WhatsApp via API Oficial da Meta se destacam da concorrência local com comunicação profissional e segura.',
    destaque: 'Capital da Paraíba, cidade que mais cresce no Nordeste.',
    populacao: '826.000'
  },
  {
    nome: 'Joinville',
    slug: 'joinville',
    estado: 'SC',
    descricao: 'Joinville é a maior cidade de Santa Catarina e um importante polo industrial do Sul do Brasil. Com mais de 600 mil habitantes, a cidade é referência nos setores metalmecânico, têxtil e de tecnologia. Empresas joinvilenses que utilizam disparo em massa no WhatsApp via API Oficial escalam sua comunicação B2B com eficiência.',
    destaque: 'Maior cidade de SC, polo industrial metalmecânico e têxtil.',
    populacao: '604.000'
  },
  {
    nome: 'Juiz de Fora',
    slug: 'juiz-de-fora',
    estado: 'MG',
    descricao: 'Juiz de Fora é a terceira maior cidade de Minas Gerais e um importante polo industrial e universitário da Zona da Mata Mineira. Com mais de 570 mil habitantes, a cidade abriga indústrias e comércio forte. Empresas juizforanas que utilizam disparo em massa no WhatsApp alcançam clientes em toda a região.',
    destaque: 'Terceira maior cidade de MG, polo industrial e universitário.',
    populacao: '573.000'
  },
  {
    nome: 'Londrina',
    slug: 'londrina',
    estado: 'PR',
    descricao: 'Londrina é a segunda maior cidade do Paraná e um polo regional de serviços, saúde e educação. Com mais de 580 mil habitantes, a cidade é referência no Norte do estado. Empresas londrinenses que utilizam disparo em massa no WhatsApp via API Oficial escalam suas comunicações com segurança.',
    destaque: 'Segunda maior cidade do PR, polo de saúde e educação do Norte paranaense.',
    populacao: '588.000'
  },
  {
    nome: 'Macapá',
    slug: 'macapa',
    estado: 'AP',
    descricao: 'Macapá é a capital do Amapá e o principal centro econômico do estado. Com mais de 500 mil habitantes, a cidade concentra a maior parte do comércio e serviços do Amapá. Empresas em Macapá que utilizam disparo em massa no WhatsApp via API Oficial conseguem se destacar no mercado local.',
    destaque: 'Capital do Amapá, centro econômico da região norte.',
    populacao: '503.000'
  },
  {
    nome: 'Maceió',
    slug: 'maceio',
    estado: 'AL',
    descricao: 'Maceió é a capital de Alagoas e o principal centro turístico e econômico do estado. Com mais de 1 milhão de habitantes, a cidade atrai milhares de turistas e negócios. Empresas maceioenses que utilizam disparo em massa no WhatsApp via API Oficial alcançam clientes com comunicação profissional e segura.',
    destaque: 'Capital de Alagoas, principal destino turístico do Nordeste.',
    populacao: '1.029.000'
  },
  {
    nome: 'Manaus',
    slug: 'manaus',
    estado: 'AM',
    descricao: 'Manaus é a capital do Amazonas e o maior centro econômico da região Norte. Com mais de 2,2 milhões de habitantes, a cidade abriga a Zona Franca de Manaus, um dos maiores polos industriais do Brasil. Empresas manauaras que utilizam disparo em massa no WhatsApp via API Oficial escalam sua comunicação B2B e B2C com segurança total. A Plug & Sales atende negócios em Manaus com infraestrutura de disparo de alto nível.',
    destaque: 'Maior cidade da região Norte, Zona Franca, 2,2 milhões de habitantes.',
    populacao: '2.255.000'
  },
  {
    nome: 'Maringá',
    slug: 'maringa',
    estado: 'PR',
    descricao: 'Maringá é a terceira maior cidade do Paraná e referência em qualidade de vida e agronegócio. Com mais de 430 mil habitantes, a cidade é um polo regional de comércio e serviços. Empresas maringaenses que utilizam disparo em massa no WhatsApp via API Oficial se destacam no mercado paranaense.',
    destaque: 'Terceira maior cidade do PR, referência em qualidade de vida.',
    populacao: '436.000'
  },
  {
    nome: 'Montes Claros',
    slug: 'montes-claros',
    estado: 'MG',
    descricao: 'Montes Claros é a principal cidade do Norte de Minas Gerais e um polo regional de saúde, educação e comércio. Com mais de 420 mil habitantes, a cidade atende consumidores de toda a região. Empresas montes-clarenses que utilizam disparo em massa no WhatsApp via API Oficial alcançam clientes em todo o Norte de MG.',
    destaque: 'Principal cidade do Norte de MG, polo regional de saúde e comércio.',
    populacao: '423.000'
  },
  {
    nome: 'Natal',
    slug: 'natal',
    estado: 'RN',
    descricao: 'Natal é a capital do Rio Grande do Norte e um dos principais destinos turísticos do Brasil. Com mais de 890 mil habitantes, a cidade tem um mercado consumidor diversificado. Empresas natalenses que utilizam disparo em massa no WhatsApp via API Oficial da Meta alcançam clientes com comunicação profissional e segura.',
    destaque: 'Capital do RN, principal destino turístico do Nordeste.',
    populacao: '896.000'
  },
  {
    nome: 'Niterói',
    slug: 'niteroi',
    estado: 'RJ',
    descricao: 'Niterói é a segunda maior cidade da região metropolitana do Rio de Janeiro e referência em qualidade de vida no estado. Com mais de 510 mil habitantes, a cidade tem um mercado consumidor de alto poder aquisitivo. Empresas niteroienses que utilizam disparo em massa no WhatsApp via API Oficial alcançam clientes qualificados.',
    destaque: 'Melhor IDH do RJ, mercado de alto poder aquisitivo.',
    populacao: '516.000'
  },
  {
    nome: 'Osasco',
    slug: 'osasco',
    estado: 'SP',
    descricao: 'Osasco é um dos principais centros econômicos da Grande São Paulo, com forte presença industrial e comercial. Com mais de 700 mil habitantes, a cidade abriga centenas de empresas de grande porte. Empresas osasquenses que utilizam disparo em massa no WhatsApp via API Oficial escalam sua comunicação com eficiência.',
    destaque: 'Um dos maiores centros econômicos da Grande SP, 700 mil habitantes.',
    populacao: '701.000'
  },
  {
    nome: 'Palmas',
    slug: 'palmas',
    estado: 'TO',
    descricao: 'Palmas é a capital de Tocantins e a última capital planejada do Brasil. Com mais de 300 mil habitantes, a cidade é o centro econômico do estado. Empresas em Palmas que utilizam disparo em massa no WhatsApp via API Oficial conseguem se destacar no mercado tocantinense.',
    destaque: 'Capital de Tocantins, última capital planejada do Brasil.',
    populacao: '306.000'
  },
  {
    nome: 'Porto Alegre',
    slug: 'porto-alegre',
    estado: 'RS',
    descricao: 'Porto Alegre é a capital do Rio Grande do Sul e o principal centro econômico, político e cultural do estado. Com mais de 1,4 milhão de habitantes na cidade e 4 milhões na região metropolitana, Porto Alegre é um mercado estratégico para disparo em massa no WhatsApp. Empresas porto-alegrenses que utilizam a API Oficial da Meta alcançam milhões de consumidores com segurança.',
    destaque: 'Capital do RS, maior centro econômico do Sul, 4 milhões na região metropolitana.',
    populacao: '1.488.000'
  },
  {
    nome: 'Porto Velho',
    slug: 'porto-velho',
    estado: 'RO',
    descricao: 'Porto Velho é a capital de Rondônia e o principal centro econômico do estado. Com mais de 540 mil habitantes, a cidade é polo regional de comércio e serviços. Empresas porto-velhenses que utilizam disparo em massa no WhatsApp via API Oficial conseguem se destacar no mercado rondoniense.',
    destaque: 'Capital de Rondônia, centro econômico do estado.',
    populacao: '548.000'
  },
  {
    nome: 'Recife',
    slug: 'recife',
    estado: 'PE',
    descricao: 'Recife é a capital de Pernambuco e um dos maiores centros econômicos do Nordeste. Com mais de 1,6 milhão de habitantes na cidade e 4 milhões na região metropolitana, Recife abriga o Porto Digital, um dos maiores parques tecnológicos do Brasil. Empresas recifenses que utilizam disparo em massa no WhatsApp via API Oficial estão na vanguarda digital.',
    destaque: 'Capital de PE, Porto Digital, 4 milhões na região metropolitana.',
    populacao: '1.662.000'
  },
  {
    nome: 'Ribeirão Preto',
    slug: 'ribeirao-preto',
    estado: 'SP',
    descricao: 'Ribeirão Preto é um dos principais centros econômicos do interior de São Paulo, referência em agronegócio, saúde e tecnologia. Com mais de 720 mil habitantes, a cidade é um polo regional estratégico. Empresas ribeirão-pretanas que utilizam disparo em massa no WhatsApp via API Oficial escalam suas comunicações com segurança.',
    destaque: 'Principal centro econômico do interior de SP, polo do agronegócio.',
    populacao: '723.000'
  },
  {
    nome: 'Rio Branco',
    slug: 'rio-branco',
    estado: 'AC',
    descricao: 'Rio Branco é a capital do Acre e o principal centro econômico do estado. Com mais de 400 mil habitantes, a cidade concentra a maior parte do comércio e serviços acreanos. Empresas rio-branquenses que utilizam disparo em massa no WhatsApp via API Oficial conseguem se destacar no mercado local.',
    destaque: 'Capital do Acre, centro econômico do estado.',
    populacao: '419.000'
  },
  {
    nome: 'Rio de Janeiro',
    slug: 'rio-de-janeiro',
    estado: 'RJ',
    descricao: 'O Rio de Janeiro é a segunda maior cidade do Brasil e um dos maiores mercados consumidores do mundo. Com mais de 6,7 milhões de habitantes na cidade e 12 milhões na região metropolitana, o Rio é um gigante econômico. Empresas cariocas que utilizam disparo em massa no WhatsApp via API Oficial alcançam milhões de consumidores com segurança e profissionalismo. A Plug & Sales é a parceira ideal para negócios no Rio de Janeiro.',
    destaque: '2ª maior cidade do Brasil, 6,7 milhões de habitantes, maior destino turístico.',
    populacao: '6.748.000'
  },
  {
    nome: 'Salvador',
    slug: 'salvador',
    estado: 'BA',
    descricao: 'Salvador é a capital da Bahia e a terceira maior cidade do Brasil em população. Com mais de 2,9 milhões de habitantes na cidade e 3,9 milhões na região metropolitana, Salvador é um mercado gigantesco para disparo em massa no WhatsApp. Empresas soteropolitanas que utilizam a API Oficial da Meta alcançam milhões de consumidores com comunicação profissional.',
    destaque: '3ª maior cidade do Brasil, maior mercado do Nordeste.',
    populacao: '2.900.000'
  },
  {
    nome: 'Santo André',
    slug: 'santo-andre',
    estado: 'SP',
    descricao: 'Santo André é um dos principais municípios da região do ABC Paulista, com forte presença industrial e comercial. Com mais de 720 mil habitantes, a cidade é um mercado estratégico. Empresas andreenses que utilizam disparo em massa no WhatsApp via API Oficial escalam sua comunicação com segurança total.',
    destaque: 'Principal cidade do ABC Paulista, polo industrial e comercial.',
    populacao: '723.000'
  },
  {
    nome: 'Santos',
    slug: 'santos',
    estado: 'SP',
    descricao: 'Santos é a principal cidade portuária do Brasil e um dos centros econômicos mais importantes do estado de São Paulo. Com mais de 430 mil habitantes, a cidade abriga o maior porto da América Latina. Empresas santistas que utilizam disparo em massa no WhatsApp via API Oficial alcançam clientes com comunicação profissional.',
    destaque: 'Maior porto da América Latina, centro logístico e comercial.',
    populacao: '433.000'
  },
  {
    nome: 'São Bernardo do Campo',
    slug: 'sao-bernardo-do-campo',
    estado: 'SP',
    descricao: 'São Bernardo do Campo é a capital do ABC Paulista e um dos principais polos industriais e automotivos do Brasil. Com mais de 840 mil habitantes, a cidade abriga montadoras e indústrias de grande porte. Empresas são-bernardenses que utilizam disparo em massa no WhatsApp via API Oficial escalam sua comunicação B2B.',
    destaque: 'Capital do ABC Paulista, polo automotivo e industrial do Brasil.',
    populacao: '845.000'
  },
  {
    nome: 'São Gonçalo',
    slug: 'sao-goncalo',
    estado: 'RJ',
    descricao: 'São Gonçalo é a segunda maior cidade do estado do Rio de Janeiro em população, com mais de 1 milhão de habitantes. A cidade tem forte presença comercial e industrial. Empresas são-gonçalenses que utilizam disparo em massa no WhatsApp via API Oficial alcançam milhões de consumidores na região metropolitana do Rio.',
    destaque: '2ª maior cidade do RJ em população, +1 milhão de habitantes.',
    populacao: '1.091.000'
  },
  {
    nome: 'São José dos Campos',
    slug: 'sao-jose-dos-campos',
    estado: 'SP',
    descricao: 'São José dos Campos é um dos principais polos tecnológicos e industriais do Brasil, conhecida como a capital do Vale do Paraíba. Com mais de 730 mil habitantes, a cidade abriga o INPE, a Embraer e centenas de empresas de tecnologia. Empresas são-joseenses que utilizam disparo em massa no WhatsApp via API Oficial estão na vanguarda digital.',
    destaque: 'Capital do Vale do Paraíba, polo aeroespacial e tecnológico do Brasil.',
    populacao: '737.000'
  },
  {
    nome: 'São Luís',
    slug: 'sao-luis',
    estado: 'MA',
    descricao: 'São Luís é a capital do Maranhão e o principal centro econômico do estado. Com mais de 1,1 milhão de habitantes, a cidade tem forte presença nos setores de serviços, comércio e turismo. Empresas ludovicenses que utilizam disparo em massa no WhatsApp via API Oficial alcançam clientes com comunicação profissional e segura.',
    destaque: 'Capital do Maranhão, centro econômico e turístico do estado.',
    populacao: '1.115.000'
  },
  {
    nome: 'São Paulo',
    slug: 'sao-paulo',
    estado: 'SP',
    descricao: 'São Paulo é a maior cidade do Brasil e o maior centro econômico da América Latina. Com mais de 12 milhões de habitantes na cidade e 21 milhões na região metropolitana, São Paulo é o mercado mais estratégico do país para disparo em massa no WhatsApp. Empresas paulistanas de todos os setores — tecnologia, finanças, comércio, indústria, serviços — utilizam a API Oficial da Meta para escalar suas comunicações. A Plug & Sales oferece a infraestrutura mais robusta de disparo em massa para a cidade de São Paulo, com capacidade empresarial e suporte dedicado.',
    destaque: 'Maior cidade da América Latina, 12 milhões de habitantes, maior mercado do Brasil.',
    populacao: '12.325.000'
  },
  {
    nome: 'Sorocaba',
    slug: 'sorocaba',
    estado: 'SP',
    descricao: 'Sorocaba é um dos principais centros industriais e logísticos do interior de São Paulo. Com mais de 700 mil habitantes, a cidade é um polo regional estratégico. Empresas sorocabanas que utilizam disparo em massa no WhatsApp via API Oficial escalam suas comunicações com segurança e eficiência.',
    destaque: 'Principal polo industrial do interior de SP, 700 mil habitantes.',
    populacao: '703.000'
  },
  {
    nome: 'Teresina',
    slug: 'teresina',
    estado: 'PI',
    descricao: 'Teresina é a capital do Piauí e a única capital do Nordeste que não está no litoral. Com mais de 870 mil habitantes, a cidade é o centro econômico e político do estado. Empresas teresinenses que utilizam disparo em massa no WhatsApp via API Oficial se destacam no mercado piauiense.',
    destaque: 'Capital do Piauí, centro econômico e político do estado.',
    populacao: '871.000'
  },
  {
    nome: 'Uberlândia',
    slug: 'uberlandia',
    estado: 'MG',
    descricao: 'Uberlândia é a segunda maior cidade de Minas Gerais e um dos principais centros logísticos e agroindustriais do Brasil. Com mais de 700 mil habitantes, a cidade é um polo estratégico do Triângulo Mineiro. Empresas uberlandenses que utilizam disparo em massa no WhatsApp via API Oficial escalam sua comunicação com eficiência.',
    destaque: '2ª maior cidade de MG, polo logístico e agroindustrial do Triângulo Mineiro.',
    populacao: '706.000'
  },
  {
    nome: 'Vitória',
    slug: 'vitoria',
    estado: 'ES',
    descricao: 'Vitória é a capital do Espírito Santo e um dos principais centros econômicos da região Sudeste. Com mais de 360 mil habitantes na cidade e 2 milhões na região metropolitana (Grande Vitória). A cidade abriga o maior porto do país em movimentação de contêineres. Empresas capixabas que utilizam disparo em massa no WhatsApp via API Oficial alcançam clientes com comunicação profissional.',
    destaque: 'Capital do ES, maior porto do Brasil, centro econômico da Grande Vitória.',
    populacao: '369.000'
  },
  {
    nome: 'Ananindeua',
    slug: 'ananindeua',
    estado: 'PA',
    descricao: 'Ananindeua é a segunda maior cidade do Pará, parte essencial da região metropolitana de Belém. Com mais de 530 mil habitantes, a cidade tem forte presença comercial e industrial. Empresas em Ananindeua que utilizam disparo em massa no WhatsApp via API Oficial alcançam clientes em todo o Grande Belém.',
    destaque: '2ª maior cidade do PA, parte vital da Grande Belém.',
    populacao: '535.000'
  },
  {
    nome: 'Volta Redonda',
    slug: 'volta-redonda',
    estado: 'RJ',
    descricao: 'Volta Redonda é um importante polo industrial do estado do Rio de Janeiro, conhecida por abrigar a Companhia Siderúrgica Nacional (CSN). Com mais de 270 mil habitantes, a cidade é referência no Sul Fluminense. Empresas em Volta Redonda que utilizam disparo em massa no WhatsApp via API Oficial escalam sua comunicação industrial e comercial.',
    destaque: 'Polo industrial do Sul Fluminense, sede da CSN.',
    populacao: '273.000'
  },
  {
    nome: 'Petrópolis',
    slug: 'petropolis',
    estado: 'RJ',
    descricao: 'Petrópolis é uma das principais cidades turísticas e industriais do estado do Rio de Janeiro. Com mais de 300 mil habitantes, a cidade é conhecida por sua indústria cervejeira, moda e turismo. Empresas petropolitanas que utilizam disparo em massa no WhatsApp via API Oficial alcançam clientes com comunicação profissional.',
    destaque: 'Principal destino turístico da serra fluminense, polo industrial e de moda.',
    populacao: '307.000'
  }
];

export function getEstadoBySlug(slug: string): Estado | undefined {
  return estados.find(e => e.slug === slug);
}

export function getCidadeBySlug(slug: string, estadoSlug: string): Cidade | undefined {
  return cidades.find(c => c.slug === slug && c.estado.toLowerCase() === estadoSlug);
}

export function getCidadesByEstado(estadoSigla: string): Cidade[] {
  return cidades.filter(c => c.estado.toLowerCase() === estadoSigla.toLowerCase());
}
