import Link from "next/link";

const STORY_POINTS = [
  {
    icon: "article",
    text: "அகரம் செய்திகள் என்பது இலங்கை மற்றும் உலகளாவிய நிகழ்வுகளை தமிழில் துல்லியமாகவும், நடுநிலையாகவும், விரைவாகவும் மக்களுக்கு கொண்டு சேர்க்கும் செய்தி இணையதளமாகும்.",
  },
  {
    icon: "groups",
    text: "அரசியல், பொருளாதாரம், விளையாட்டு, தொழில்நுட்பம், கல்வி, வணிகம், பொதுப்போக்கு உள்ளிட்ட பல்வேறு துறைகளில் முக்கிய செய்திகள் மற்றும் நம்பகமான தகவல்களை வழங்குவதே எங்களின் நோக்கமாகும்.",
  },
  {
    icon: "verified_user",
    text: "உண்மைத்தன்மை, பொறுப்புணர்வு மற்றும் தரமான செய்தி வழங்கலை அடிப்படையாகக் கொண்டு, தமிழ்ச் சமூகத்திற்கு நம்பகமான செய்தி மூலமாக திகழ்வதற்கு நாம் உறுதிபூண்டுள்ளோம்.",
  },
];

const VALUES = [
  {
    icon: "workspace_premium",
    title: "நம்பகத்தன்மை",
    description: "உண்மை மற்றும் துல்லியமான செய்திகளுக்கு முன்னுரிமை",
  },
  {
    icon: "schedule",
    title: "விரைவான வெளியீடு",
    description: "நிகழ்வுகளை உடனுக்குடன் உங்கள் கைகளில்",
  },
  {
    icon: "diversity_3",
    title: "பரந்த கவரேஜ்",
    description: "உள்ளூர் முதல் உலகளாவிய செய்திகள் வரை",
  },
  {
    icon: "verified_user",
    title: "நடுநிலை & பொறுப்புணர்வு",
    description: "நேர்மையான பத்திரிகை எங்கள் அடையாளம்",
  },
];

function RedIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined text-[#ef2b2d] ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export default function AboutPage() {
  return (
    <main className="flex-1 bg-white text-[#171717]">
      <section
        className="relative min-h-[300px] overflow-hidden bg-[#fafafa] bg-cover bg-[72%_center] bg-no-repeat sm:min-h-[370px] sm:bg-center lg:min-h-[430px]"
        style={{ backgroundImage: "url('/images/aboutus.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10 sm:via-white/60 lg:via-transparent" />
        <div className="relative flex min-h-[300px] w-full flex-col py-6 pl-3 pr-3 sm:min-h-[370px] sm:py-8 sm:pl-5 sm:pr-5 md:pl-11 md:pr-8 lg:min-h-[430px] xl:pl-[116px] xl:pr-12">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-bold text-[#2e2e2e] sm:text-sm"
          >
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 transition-colors hover:text-[#ef2b2d]"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                home
              </span>
              <span>முகப்பு</span>
            </Link>
            <span className="material-symbols-outlined text-[17px] text-[#777]" aria-hidden="true">
              chevron_right
            </span>
            <span aria-current="page">எங்களை பற்றி</span>
          </nav>

          <div className="my-auto max-w-[610px] py-10">
            <h1 className="text-[34px] font-black leading-tight text-black sm:text-[46px] lg:text-[54px]">
              எங்களைப் பற்றி
            </h1>
            <div className="mt-4 h-1 w-16 bg-[#ef2b2d] sm:mt-5 sm:w-20" />
            <p className="mt-8 text-base font-bold leading-8 text-[#262626] sm:mt-10 sm:text-xl">
              உண்மையைத் தேடும் எங்கள் பயணம்
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1140px] px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <div>
          {STORY_POINTS.map((point, index) => (
            <article
              key={point.icon}
              className={`grid gap-4 py-6 sm:grid-cols-[76px_1fr] sm:items-center sm:gap-7 sm:py-7 ${
                index < STORY_POINTS.length - 1
                  ? "border-b border-[#e2e2e2]"
                  : ""
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f0] sm:h-16 sm:w-16">
                <RedIcon name={point.icon} className="text-[30px] sm:text-[34px]" />
              </div>
              <p className="text-[15px] font-semibold leading-8 text-[#222] sm:text-[17px] sm:leading-9">
                {point.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-7 grid divide-y divide-[#e3e3e3] overflow-hidden rounded-lg border border-[#dedede] bg-white sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {VALUES.map((value, index) => (
            <article
              key={value.title}
              className={`flex min-h-[225px] flex-col items-center justify-start px-5 py-7 text-center ${
                index % 2 === 0 ? "sm:border-r sm:border-[#e3e3e3]" : ""
              } ${index < 2 ? "sm:border-b sm:border-[#e3e3e3] lg:border-b-0" : ""} ${
                index < 3 ? "lg:border-r lg:border-[#e3e3e3]" : ""
              }`}
            >
              <div className="flex h-14 shrink-0 items-center justify-center">
                <RedIcon name={value.icon} className="text-[46px] sm:text-[50px]" />
              </div>
              <h2 className="mt-3 flex min-h-14 items-center justify-center text-[16px] font-black leading-7 text-[#202020] sm:text-[17px]">
                {value.title}
              </h2>
              <p className="mt-2 max-w-[210px] text-sm font-medium leading-7 text-[#666]">
                {value.description}
              </p>
            </article>
          ))}
        </div>

        <aside
          className="relative mt-8 overflow-hidden rounded-lg border-l-4 border-[#ef2b2d] bg-[#fff5f5] bg-cover bg-right bg-no-repeat px-5 py-8 sm:px-8 lg:px-10"
          style={{ backgroundImage: "url('/images/aboutus.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#fff5f5] via-[#fff5f5]/95 to-[#fff5f5]/55" />
          <div className="relative flex max-w-[720px] flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md sm:h-20 sm:w-20">
              <RedIcon name="send" className="text-[34px] sm:text-[40px]" />
            </div>
            <div>
              <h2 className="text-lg font-black leading-8 text-[#1f1f1f]">
                உங்கள் ஆதரவே எங்கள் வலிமை
              </h2>
              <p className="mt-2 text-sm font-semibold leading-7 text-[#565656] sm:text-[15px]">
                உங்கள் நம்பிக்கையும் ஆதரவும் எங்களை மேலும் சிறப்பாக செயல்பட
                ஊக்குவிக்கிறது.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
