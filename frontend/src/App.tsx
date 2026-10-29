import { useEffect, useState, type FormEvent } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Check,
  CalendarDays, ChevronDown, Clock3, Heart, Instagram, MapPin, Menu, MessageCircle,
  MoveUpRight, Navigation, ShieldCheck, Video, X
} from 'lucide-react';
import { fallbackClinic, getClinic, whatsappLink, whatsappMessageLink, type Clinic } from './clinic';
import { createOnlineEvaluationMessage, validateEvaluationPreferences } from './evaluationRequest';

const concerns = [
  { index: '01', title: 'Dor na coluna', description: 'Quando a dor nas costas ou no pescoço começa a interferir na sua rotina.' },
  { index: '02', title: 'Desconforto nas articulações', description: 'Joelhos, ombros e outras regiões que merecem atenção.' },
  { index: '03', title: 'Dificuldade de movimento', description: 'Quando atividades simples passam a exigir mais esforço.' },
  { index: '04', title: 'Recuperação física', description: 'Quando você precisa entender como retomar seus movimentos com orientação.' },
];

const questions = [
  {
    question: 'Como faço para agendar uma avaliação?',
    answer: 'É simples: toque no botão de WhatsApp, envie a mensagem já preenchida e converse com a equipe sobre horários disponíveis.',
  },
  {
    question: 'A clínica atende por convênio?',
    answer: 'Os convênios e as condições de atendimento devem ser confirmados diretamente com a equipe pelo WhatsApp.',
  },
  {
    question: 'Qual é o valor da avaliação?',
    answer: 'Entre em contato pelo WhatsApp para consultar valores, formas de pagamento e disponibilidade.',
  },
  {
    question: 'Onde fica o Instituto da Dor?',
    answer: 'Estamos no Setor Sul do Gama, em Brasília/DF, na Quadra 3, Conjunto A, Lote 20, Sala 204. Você encontra o trajeto na seção de localização.',
  },
  {
    question: 'Posso fazer minha avaliação sem sair de casa?',
    answer: 'Você pode solicitar uma avaliação por videochamada. A equipe confirma a disponibilidade e o fisioterapeuta verifica se o atendimento remoto é adequado para sua situação. Quando necessário, poderá ser indicada uma avaliação presencial.',
  },
  {
    question: 'Vou receber orientação de exercícios pela videochamada?',
    answer: 'O fisioterapeuta poderá orientar movimentos e exercícios quando forem apropriados ao seu caso. A conduta é individualizada e depende da avaliação profissional.',
  },
  {
    question: 'Como recebo o link da avaliação online?',
    answer: 'Após a equipe confirmar sua data, horário e condições de atendimento pelo WhatsApp, ela enviará as orientações e o link da videochamada. O formulário do site não confirma a reserva automaticamente.',
  },
];

function WhatsAppButton({ clinic, label, context = '', variant = 'primary', className = '' }: {
  clinic: Clinic;
  label: string;
  context?: string;
  variant?: 'primary' | 'light' | 'outline';
  className?: string;
}) {
  return (
    <a
      className={`whatsapp-button whatsapp-button--${variant} ${className}`}
      href={whatsappLink(clinic, context)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (abre o WhatsApp em outra aba)`}
    >
      <MessageCircle size={19} aria-hidden="true" />
      <span>{label}</span>
      <ArrowUpRight size={18} className="button-arrow" aria-hidden="true" />
    </a>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a href="#inicio" className={`brand ${light ? 'brand--light' : ''}`} aria-label="Instituto da Dor, voltar ao início">
      <span className="brand-symbol" aria-hidden="true" />
      <span className="brand-copy">
        <strong>INSTITUTO DA DOR</strong>
        <small>GUILHERME ARAÚJO</small>
      </span>
    </a>
  );
}

function App() {
  const [clinic, setClinic] = useState<Clinic>(fallbackClinic);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [bookingName, setBookingName] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingConsent, setBookingConsent] = useState(false);
  const [bookingError, setBookingError] = useState<{ field: 'name' | 'date' | 'time'; message: string } | null>(null);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => { void getClinic().then(setClinic); }, []);

  const closeMenu = () => setMenuOpen(false);

  const submitOnlineBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateEvaluationPreferences({ name: bookingName, date: bookingDate, time: bookingTime }, today);
    if (!validation.valid) {
      setBookingError({ field: validation.field, message: validation.message });
      return;
    }
    setBookingError(null);
    if (!bookingConsent) return;

    const message = createOnlineEvaluationMessage(validation.name, bookingDate, bookingTime);
    window.open(whatsappMessageLink(clinic, message), '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="announcement">
        <div className="wide-container announcement-inner">
          <span><span className="online-dot" /> Cuidar de você começa com o primeiro passo.</span>
          <span className="announcement-location"><MapPin size={13} aria-hidden="true" /> Gama, Brasília — DF</span>
        </div>
      </div>

      <header className="site-header">
        <div className="wide-container header-inner">
          <Brand />
          <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} aria-label="Navegação principal">
            <a href="#inicio" onClick={closeMenu}>Início</a>
            <a href="#sobre" onClick={closeMenu}>O Instituto</a>
            <a href="#avaliacao-online" onClick={closeMenu}>Avaliação online</a>
            <a href="#como-funciona" onClick={closeMenu}>Como agendar</a>
            <a href="#localizacao" onClick={closeMenu}>Localização</a>
            <div className="mobile-menu-cta">
              <WhatsAppButton clinic={clinic} label="Agendar minha avaliação" context="Quero saber os horários disponíveis." />
            </div>
          </nav>
          <WhatsAppButton clinic={clinic} label="Agendar avaliação" className="header-cta" context="Quero saber os horários disponíveis." />
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-noise" aria-hidden="true" />
          <div className="wide-container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> FISIOTERAPIA NO GAMA</div>
              <h1>O cuidado que seu corpo precisa começa <em>por uma conversa.</em></h1>
              <p className="hero-description">
                Sua dor merece ser ouvida. Dê o primeiro passo para entender o que você está sentindo e conversar com um profissional sobre sua avaliação.
              </p>
              <div className="hero-actions">
                <WhatsAppButton clinic={clinic} label="Quero agendar minha avaliação" context="Gostaria de conversar sobre uma avaliação de fisioterapia." variant="light" />
                <a href="#avaliacao-online" className="quiet-link"><Video size={19} /> Avaliação online por vídeo <ArrowDownRight size={17} /></a>
              </div>
              <div className="hero-trust"><span className="trust-check"><Check size={15} /></span> Atendimento em fisioterapia no Gama / DF</div>
            </div>

            <div className="hero-art" aria-label="Composição gráfica abstrata sobre cuidado e movimento">
              <div className="hero-art-orbit orbit-one" aria-hidden="true" />
              <div className="hero-art-orbit orbit-two" aria-hidden="true" />
              <div className="hero-art-orbit orbit-three" aria-hidden="true" />
              <div className="hero-art-disc">
                <div className="body-line-art" aria-hidden="true">
                  <svg viewBox="0 0 310 390" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M155 22C135 22 122 40 124 62C126 79 137 88 142 95M155 22C175 22 188 40 186 62C184 79 173 88 168 95" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round"/>
                    <path d="M140 90C137 103 119 111 95 120C65 131 60 160 58 197L43 280M170 90C173 103 191 111 215 120C245 131 250 160 252 197L267 280" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round"/>
                    <path d="M97 121C110 145 116 173 117 203C120 236 104 253 107 282L119 367M213 121C200 145 194 173 193 203C190 236 206 253 203 282L191 367" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round"/>
                    <path d="M140 96Q155 114 170 96M117 204Q155 214 193 204M107 282Q155 298 203 282" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                    <path d="M155 103V287M155 287L148 362M155 287L162 362" stroke="#B7D9BF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 9"/>
                    <circle cx="155" cy="176" r="18" stroke="#DCE9DF" strokeWidth="1.8" />
                    <circle cx="155" cy="176" r="8" fill="#DCE9DF" />
                    <circle cx="155" cy="176" r="33" stroke="#DCE9DF" strokeOpacity=".45" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              <div className="hero-art-note">
                <span className="note-icon"><Heart size={20} fill="currentColor" strokeWidth={1.5}/></span>
                <span>Cuidar do movimento<br/><strong>é cuidar da vida.</strong></span>
              </div>
              <div className="hero-art-caption"><span>ATENÇÃO</span> <span className="caption-divider" /> <span>MOVIMENTO</span> <span className="caption-divider" /> <span>CUIDADO</span></div>
            </div>
          </div>
          <div className="hero-side-text" aria-hidden="true">MOVIMENTO & BEM-ESTAR</div>
        </section>

        <div className="value-strip">
          <div className="wide-container value-strip-inner">
            <div><ShieldCheck size={22} /><span>Avaliação como primeiro passo</span></div>
            <div><Activity size={22} /><span>Foco na sua saúde e movimento</span></div>
            <div><Video size={22} /><span>Presencial ou por videochamada</span></div>
          </div>
        </div>

        <section className="section about" id="sobre">
          <div className="wide-container about-grid">
            <div className="about-visual">
              <div className="about-panel">
                <span className="about-panel-number">01 <span>/ 03</span></span>
                <div className="about-panel-art" aria-hidden="true">
                  <span className="line-loop line-loop-a" />
                  <span className="line-loop line-loop-b" />
                  <span className="line-loop line-loop-c" />
                  <span className="line-loop line-loop-d" />
                </div>
                <span className="about-panel-footer">SEU BEM-ESTAR IMPORTA <MoveUpRight size={22} /></span>
              </div>
              <div className="about-floating-card">
                <span className="floating-heart"><Heart size={23} /></span>
                <div><strong>Um passo de cada vez.</strong><small>Comece pela avaliação.</small></div>
              </div>
            </div>
            <div className="about-copy">
              <div className="eyebrow eyebrow--dark"><span className="eyebrow-line" /> PRAZER, SOMOS O INSTITUTO DA DOR</div>
              <h2>Um espaço para dar atenção ao que o seu corpo está dizendo.</h2>
              <p>Sabemos que sentir dor pode afetar muito mais do que o movimento: pode mudar sua rotina, seu descanso e até os planos mais simples do dia.</p>
              <p>O Instituto da Dor é uma clínica de fisioterapia localizada no Gama, em Brasília. O ponto de partida é buscar orientação profissional e entender quais cuidados podem fazer sentido para você.</p>
              <div className="about-highlight">
                <span className="about-highlight-icon"><Check size={20} /></span>
                <span>Não é preciso ter todas as respostas antes de procurar uma avaliação.</span>
              </div>
              <a href="#como-funciona" className="text-link">Veja como agendar <ArrowUpRight size={19} /></a>
            </div>
          </div>
        </section>

        <section className="section concerns" id="para-quem">
          <div className="wide-container">
            <div className="section-heading">
              <div>
                <div className="eyebrow eyebrow--dark"><span className="eyebrow-line" /> VOCÊ SE IDENTIFICA?</div>
                <h2>Seu corpo dá sinais.<br/><em>Vale a pena escutá-los.</em></h2>
              </div>
              <p>Algumas situações podem ser um motivo para buscar orientação de um profissional de fisioterapia.</p>
            </div>
            <div className="concern-grid">
              {concerns.map((item) => (
                <article className="concern-card" key={item.index}>
                  <div className="concern-top"><span>{item.index}</span><ArrowUpRight size={22} /></div>
                  <div className="concern-bottom"><h3>{item.title}</h3><p>{item.description}</p></div>
                </article>
              ))}
            </div>
            <p className="clinical-note">A necessidade e o tipo de tratamento dependem de avaliação profissional individualizada.</p>
          </div>
        </section>

        <section className="section online-evaluation" id="avaliacao-online" aria-labelledby="online-evaluation-title">
          <div className="wide-container online-grid">
            <div className="online-copy">
              <div className="eyebrow eyebrow--dark"><span className="eyebrow-line" /> AVALIAÇÃO ONLINE</div>
              <span className="online-tag"><Video size={15} aria-hidden="true" /> POR VIDEOCHAMADA</span>
              <h2 id="online-evaluation-title">Cuidado e orientação, <em>mesmo à distância.</em></h2>
              <p className="online-lead">Prefere não sair de casa? Solicite uma avaliação de fisioterapia por vídeo e converse com um profissional sobre seus movimentos, suas dúvidas e os próximos cuidados.</p>
              <div className="online-benefits">
                <div className="online-benefit"><span><CalendarDays size={21} /></span><div><h3>Escolha sua preferência</h3><p>Informe o dia e o horário em que gostaria de conversar.</p></div></div>
                <div className="online-benefit"><span><MessageCircle size={21} /></span><div><h3>Confirme pelo WhatsApp</h3><p>A equipe verifica a agenda, informa as condições e envia o link após confirmar.</p></div></div>
                <div className="online-benefit"><span><Video size={21} /></span><div><h3>Converse por videochamada</h3><p>O fisioterapeuta avalia o que for possível remotamente e orienta exercícios quando indicados.</p></div></div>
              </div>
              <p className="online-clinical-note"><ShieldCheck size={18} aria-hidden="true" /> O atendimento remoto depende de consentimento, privacidade e avaliação de adequação pelo profissional. Uma consulta presencial poderá ser necessária.</p>
            </div>

            <div className="online-booking-card">
              <div className="booking-card-heading">
                <span className="booking-card-icon"><CalendarDays size={25} /></span>
                <div><span className="booking-kicker">SOLICITAÇÃO DE HORÁRIO</span><h3>Peça sua avaliação online</h3></div>
              </div>
              <p className="booking-intro">Escolha quando prefere ser atendido. Vamos preparar a mensagem para a equipe no WhatsApp.</p>
              <form onSubmit={submitOnlineBooking} className="online-booking-form">
                <label htmlFor="booking-name">Seu nome <span aria-hidden="true">*</span></label>
                <input id="booking-name" name="nome" type="text" autoComplete="name" placeholder="Como podemos chamar você?" minLength={2} maxLength={80} value={bookingName} onChange={(event) => { setBookingName(event.target.value); setBookingError(null); }} aria-invalid={bookingError?.field === 'name'} aria-describedby={bookingError?.field === 'name' ? 'booking-error' : undefined} required />
                <div className="booking-form-row">
                  <div><label htmlFor="booking-date">Data de preferência <span aria-hidden="true">*</span></label><input id="booking-date" name="data" type="date" min={today} value={bookingDate} onChange={(event) => { setBookingDate(event.target.value); setBookingError(null); }} aria-invalid={bookingError?.field === 'date'} aria-describedby={bookingError?.field === 'date' ? 'booking-error' : undefined} required /></div>
                  <div><label htmlFor="booking-time">Horário de preferência <span aria-hidden="true">*</span></label><input id="booking-time" name="horario" type="time" value={bookingTime} onChange={(event) => { setBookingTime(event.target.value); setBookingError(null); }} aria-invalid={bookingError?.field === 'time'} aria-describedby={bookingError?.field === 'time' ? 'booking-error' : undefined} required /></div>
                </div>
                {bookingError && <p id="booking-error" className="booking-error" role="alert">{bookingError.message}</p>}
                <p className="booking-availability"><Clock3 size={16} aria-hidden="true" /> Horários sugeridos não ficam reservados até a confirmação da equipe.</p>
                <label className="booking-consent" htmlFor="booking-consent"><input id="booking-consent" type="checkbox" checked={bookingConsent} onChange={(event) => setBookingConsent(event.target.checked)} required /><span>Concordo em enviar meu nome, data e horário de preferência à equipe pelo WhatsApp para solicitar o agendamento.</span></label>
                <p className="booking-privacy-note">Ao continuar, o WhatsApp será aberto com as informações fornecidas. Revise e envie sua mensagem. O horário depende de confirmação da clínica. O WhatsApp é um serviço de terceiro.</p>
                <button type="submit" className="booking-submit"><MessageCircle size={20} /> Solicitar horário no WhatsApp <ArrowUpRight size={18} aria-hidden="true" /></button>
              </form>
              <p className="booking-footer-note"><Check size={15} aria-hidden="true" /> Sem cobrança ou reserva automática pelo site. Valores e disponibilidade são informados pela equipe.</p>
            </div>
          </div>
        </section>

        <section className="section journey" id="como-funciona">
          <div className="wide-container">
            <div className="journey-header">
              <div className="eyebrow"><span className="eyebrow-line" /> SIMPLES DO COMEÇO AO FIM</div>
              <h2>Seu primeiro passo<br/>está a <em>uma mensagem.</em></h2>
              <p>Para avaliação presencial, fale diretamente com a equipe. Para videochamada, você também pode solicitar seu horário pelo formulário online.</p>
            </div>
            <div className="steps">
              <div className="step"><span className="step-number">01</span><div className="step-symbol"><MessageCircle size={29} /></div><h3>Chame no WhatsApp</h3><p>Clique no botão e envie a mensagem de interesse na avaliação.</p></div>
              <div className="step-divider" aria-hidden="true"><ArrowRight size={23} /></div>
              <div className="step"><span className="step-number">02</span><div className="step-symbol"><Heart size={29} /></div><h3>Converse com a equipe</h3><p>Tire dúvidas sobre horários, valores e o atendimento.</p></div>
              <div className="step-divider" aria-hidden="true"><ArrowRight size={23} /></div>
              <div className="step"><span className="step-number">03</span><div className="step-symbol"><Check size={29} /></div><h3>Combine sua avaliação</h3><p>Confirme com a equipe a data e o horário disponíveis.</p></div>
            </div>
            <div className="journey-action"><WhatsAppButton clinic={clinic} label="Começar minha conversa" variant="light" context="Quero combinar uma data e um horário para avaliação." /></div>
          </div>
        </section>

        <section className="section location-section" id="localizacao">
          <div className="wide-container location-grid">
            <div className="location-copy">
              <div className="eyebrow eyebrow--dark"><span className="eyebrow-line" /> NOS ENCONTRE</div>
              <h2>Mais perto de você, <em>no coração do Gama.</em></h2>
              <p>Estamos no Gama, em Brasília/DF. Ao agendar, confirme com a equipe as orientações para sua visita.</p>
              <div className="location-details">
                <div className="location-detail-icon"><MapPin size={23} /></div>
                <div><small>ENDEREÇO</small><strong>{clinic.address}</strong><span>{clinic.locality}</span></div>
              </div>
              <div className="location-actions">
                <a href={clinic.mapUrl} target="_blank" rel="noopener noreferrer" className="outline-action"><Navigation size={18} /> Ver rota no mapa <ArrowUpRight size={17}/></a>
                <a href={clinic.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-link"><Instagram size={20} /> Instagram</a>
              </div>
            </div>
            <a href={clinic.mapUrl} target="_blank" rel="noopener noreferrer" className="map-panel" aria-label="Abrir a localização do Instituto da Dor no Google Maps">
              <div className="map-grid" aria-hidden="true" />
              <div className="map-road road-a" aria-hidden="true" />
              <div className="map-road road-b" aria-hidden="true" />
              <div className="map-road road-c" aria-hidden="true" />
              <div className="map-road road-d" aria-hidden="true" />
              <span className="map-pin"><MapPin size={31} fill="currentColor" strokeWidth={1.5} /></span>
              <div className="map-bubble"><strong>Instituto da Dor</strong><span>Gama · Brasília / DF</span></div>
              <div className="map-bottom-label"><Navigation size={18}/> ABRIR NO GOOGLE MAPS <ArrowUpRight size={18}/></div>
            </a>
          </div>
        </section>

        <section className="section faq-section" id="duvidas">
          <div className="wide-container faq-grid">
            <div className="faq-intro">
              <div className="eyebrow eyebrow--dark"><span className="eyebrow-line" /> DÚVIDAS FREQUENTES</div>
              <h2>Vamos deixar<br/>tudo mais <em>claro?</em></h2>
              <p>Reunimos respostas para facilitar o seu primeiro contato.</p>
              <WhatsAppButton clinic={clinic} label="Ainda tenho uma dúvida" variant="outline" context="Tenho uma dúvida sobre o atendimento." />
            </div>
            <div className="faq-list">
              {questions.map((item, index) => (
                <div className={`faq-item ${faqOpen === index ? 'faq-item--open' : ''}`} key={item.question}>
                  <button type="button" onClick={() => setFaqOpen(faqOpen === index ? null : index)} aria-expanded={faqOpen === index}>
                    <span>{item.question}</span><ChevronDown size={21} />
                  </button>
                  {faqOpen === index && <p>{item.answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="wide-container final-cta-inner">
            <div className="final-cta-glow" aria-hidden="true" />
            <div className="eyebrow"><span className="eyebrow-line" /> O PRIMEIRO PASSO É SEU</div>
            <h2>Que tal começar a cuidar<br/>de você <em>hoje?</em></h2>
            <p>Entre em contato e converse com a equipe sobre o agendamento da sua avaliação.</p>
            <WhatsAppButton clinic={clinic} label="Agendar avaliação pelo WhatsApp" variant="light" context="Quero agendar uma avaliação de fisioterapia." />
            <span className="final-contact">Ou fale com a equipe: {clinic.phone}</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wide-container footer-main">
          <div className="footer-brand"><Brand light /><p>Fisioterapia no Gama / DF.<br/>Seu próximo passo começa por uma conversa.</p></div>
          <div className="footer-col"><h4>NAVEGAÇÃO</h4><a href="#sobre">O Instituto</a><a href="#para-quem">Para quem é</a><a href="#avaliacao-online">Avaliação online</a><a href="#como-funciona">Como agendar</a><a href="#duvidas">Dúvidas frequentes</a></div>
          <div className="footer-col"><h4>CONTATO</h4><a href={whatsappLink(clinic, '')} target="_blank" rel="noopener noreferrer">{clinic.phone}</a><a href={clinic.instagramUrl} target="_blank" rel="noopener noreferrer">@institutodorgama</a><a href="#localizacao">Gama, Brasília — DF</a></div>
        </div>
        <div className="wide-container footer-bottom"><span>© {new Date().getFullYear()} Instituto da Dor. Todos os direitos reservados.</span><span>Informações orientativas. A definição do cuidado depende de avaliação profissional.</span></div>
      </footer>

      <div className="mobile-sticky-actions" aria-label="Escolha a modalidade da avaliação">
        <a className="mobile-sticky-cta mobile-sticky-cta--presencial" href={whatsappLink(clinic, 'Quero agendar uma avaliação presencial de fisioterapia.')} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/> Presencial</a>
        <a className="mobile-sticky-cta mobile-sticky-cta--online" href="#avaliacao-online"><Video size={18}/> Online por vídeo</a>
      </div>
    </>
  );
}

export default App;
