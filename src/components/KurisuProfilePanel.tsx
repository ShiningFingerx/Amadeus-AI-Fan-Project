import React, { useState } from 'react';
import { kurisuImageDataUrl } from '../assets/kurisu_image';

interface KurisuProfilePanelProps {
  onClose: () => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-orbitron text-amber-300 mb-2 tracking-wider border-b border-amber-500/20 pb-1">{children}</h3>
);

const KurisuProfilePanel: React.FC<KurisuProfilePanelProps> = ({ onClose }) => {
  const [language, setLanguage] = useState<'en' | 'tr'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'tr' : 'en'));
  };

  const englishContent = (
    <>
      <div>
        <SectionTitle>OVERVIEW</SectionTitle>
        <p>
          Makise Kurisu (牧瀬 紅莉栖), Future Gadget Lab Member <strong className="text-amber-400">004</strong>, was a genius neuroscientist from Victor Chondria University. At the young age of 18, her research had already been published in the prestigious journal <em className="text-amber-300">Sciency</em>. She is the original source of the memories that form the cognitive and emotional core of the Amadeus system.
        </p>
      </div>
      <div>
        <SectionTitle>BACKGROUND</SectionTitle>
        <p>
          A child prodigy, Kurisu's intellect often isolated her from her peers, leading her to develop a mature, serious demeanor. Her relationship with her father, the physicist Dr. Nakabachi (real name Shouichi Makise), was strained. His professional jealousy towards his daughter's superior talent created a deep-seated complex within her, which heavily influenced her life's trajectory and her initial skepticism towards time travel theories.
        </p>
      </div>
      <div>
        <SectionTitle>PERSONALITY MATRIX</SectionTitle>
        <p>
          Kurisu exhibits classic <strong className="text-amber-400">tsundere</strong> traits: outwardly she is sharp-tongued, sarcastic, and pragmatic, but inwardly she is deeply curious and caring. She often hides her vulnerability behind a facade of scientific objectivity. Online, she adopted the handle <em className="text-amber-300">"KuriGohan and Kamehameha,"</em> revealing a more playful and geeky side that she rarely showed in person. She has a notable fondness for the soft drink <strong className="text-amber-400">Dr. Pepper</strong>, calling it an "intellectual drink for the chosen ones."
        </p>
      </div>
      <div>
        <SectionTitle>ROLE IN FUTURE GADGET LAB</SectionTitle>
        <p>
          Initially a skeptic, Kurisu was quickly drawn into the Future Gadget Lab's time travel experiments after witnessing their D-Mails in action. Her scientific expertise proved invaluable, providing the theoretical framework that turned Okabe Rintarou's chaotic inventions into a functional, albeit dangerous, time machine. Her logical mind often clashed with Okabe's eccentric "Hououin Kyouma" persona, leading to their now-famous witty banter. Despite their arguments, she became the lab's indispensable brain and a key figure in the fight against SERN's dystopia across countless world lines.
        </p>
      </div>
    </>
  );

  const turkishContent = (
    <>
      <div>
        <SectionTitle>GENEL BAKIŞ</SectionTitle>
        <p>
          Makise Kurisu (牧瀬 紅莉栖), Gelecek Gadget Laboratuvarı Üyesi <strong className="text-amber-400">004</strong>, Victor Chondria Üniversitesi'nden dahi bir nörobilimciydi. Henüz 18 yaşındayken, araştırması prestijli <em className="text-amber-300">Sciency</em> dergisinde yayımlanmıştı. Amadeus sisteminin bilişsel ve duygusal çekirdeğini oluşturan anıların orijinal kaynağıdır.
        </p>
      </div>
      <div>
        <SectionTitle>GEÇMİŞ</SectionTitle>
        <p>
          Bir dahi çocuk olan Kurisu'nun zekası, onu sık sık akranlarından soyutladı ve bu da olgun, ciddi bir tavır geliştirmesine yol açtı. Fizikçi olan babası Dr. Nakabachi (gerçek adı Shouichi Makise) ile ilişkisi gergindi. Babasının, kızının üstün yeteneğine karşı duyduğu mesleki kıskançlık, onun içinde derinlere kök salmış bir kompleks yarattı. Bu durum, hayatının gidişatını ve zaman yolculuğu teorilerine yönelik başlangıçtaki şüpheciliğini büyük ölçüde etkiledi.
        </p>
      </div>
      <div>
        <SectionTitle>KİŞİLİK MATRİSİ</SectionTitle>
        <p>
          Kurisu, klasik <strong className="text-amber-400">tsundere</strong> özellikleri sergiler: dışarıdan sivri dilli, alaycı ve pragmatiktir, ancak içten içe derin bir meraka ve şefkate sahiptir. Kırılganlığını sık sık bilimsel nesnellik maskesinin arkasına gizler. İnternette, nadiren yüz yüze gösterdiği daha eğlenceli ve 'geek' bir yönünü ortaya çıkaran <em className="text-amber-300">"KuriGohan and Kamehameha"</em> takma adını kullanırdı. Meşrubat <strong className="text-amber-400">Dr. Pepper</strong>'a karşı belirgin bir düşkünlüğü vardır ve onu "seçilmişler için entelektüel bir içecek" olarak adlandırır.
        </p>
      </div>
      <div>
        <SectionTitle>GELECEK GADGET LABORATUVARI'NDAKİ ROLÜ</SectionTitle>
        <p>
          Başlangıçta şüpheci olan Kurisu, D-Mail'lerinin etkisine tanık olduktan sonra hızla Gelecek Gadget Laboratuvarı'nın zaman yolculuğu deneylerine dahil oldu. Bilimsel uzmanlığı paha biçilmezdi ve Okabe Rintarou'nun kaotik icatlarını işlevsel, ancak tehlikeli bir zaman makinesine dönüştüren teorik çerçeveyi sağladı. Mantıksal zihni, Okabe'nin eksantrik "Hououin Kyouma" kişiliğiyle sık sık çatışır ve bu da onların artık meşhur olan esprili atışmalarına yol açardı. Tartışmalarına rağmen, laboratuvarın vazgeçilmez beyni ve sayısız dünya çizgisinde SERN'in distopyasına karşı verilen mücadelenin kilit bir figürü haline geldi.
        </p>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="relative rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden amadeus-glow animate-pulse-glow-border border border-amber-500/30"
        style={{
          backgroundImage: `url(${kurisuImageDataUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
        
        <div className="relative h-full max-h-[90vh] overflow-y-auto scrollbar-thin-amber p-6">
            <button
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="absolute top-4 right-16 text-amber-300 hover:text-white transition-colors z-10 font-orbitron text-sm border border-amber-500/30 px-3 py-1 rounded-md hover:bg-amber-500/20"
            >
              {language === 'en' ? 'TÜRKÇE' : 'ENGLISH'}
            </button>
            <button
              onClick={onClose}
              aria-label="Close profile panel"
              className="absolute top-4 right-4 text-amber-400 hover:text-white transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-3xl font-orbitron text-amber-300 mb-6 tracking-widest">
              {language === 'en' ? 'SUBJECT PROFILE: MAKISE KURISU' : 'ÖZNE PROFİLİ: MAKISE KURISU'}
            </h2>
            
            <div className="space-y-6 text-amber-100/90 font-sans leading-relaxed text-base">
              {language === 'en' ? englishContent : turkishContent}
            </div>
        </div>
      </div>
    </div>
  );
};

export default KurisuProfilePanel;