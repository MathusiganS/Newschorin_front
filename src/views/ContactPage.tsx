import Link from "next/link";

const CONTACT_OPTIONS = [
  {
    icon: "edit_square",
    title: "ஆசிரியர் குழு",
    englishTitle: "Editorial",
    email: "editor@akaramnews.com",
    description:
      "செய்தி குறிப்புகள், ஊடக அறிக்கைகள் மற்றும் செய்திக்கான தகவல்கள் அல்லது ஆலோசனைகளை எங்களுக்கு அனுப்பலாம்.",
  },
  {
    icon: "group",
    title: "பொதுவான விசாரணைகள்",
    englishTitle: "General",
    email: "info@akaramnews.com",
    description:
      "பொதுவான தகவல்கள், கருத்துக்கள், ஆலோசனைகள் அல்லது பிற விசாரணைகளுக்கு எங்களை இந்த மின்னஞ்சல் முகவரி மூலம் தொடர்புகொள்ளலாம்.",
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
      className={`material-symbols-outlined text-[#ef2024] ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export default function ContactPage() {
  return (
    <main className="flex-1 bg-white text-[#171717]">
      <section
        className="relative min-h-[320px] overflow-hidden bg-[#fafafa] bg-cover bg-[72%_center] bg-no-repeat sm:min-h-[400px] sm:bg-center lg:min-h-[470px]"
        style={{ backgroundImage: "url('/images/contactus%20.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10 sm:via-white/60 lg:via-transparent" />
        <div className="relative flex min-h-[320px] w-full flex-col py-6 pl-3 pr-3 sm:min-h-[400px] sm:py-8 sm:pl-5 sm:pr-5 md:pl-11 md:pr-8 lg:min-h-[470px] xl:pl-[116px] xl:pr-12">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-bold text-[#2e2e2e] sm:text-sm"
          >
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 transition-colors hover:text-[#ef2024]"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                aria-hidden="true"
              >
                home
              </span>
              <span>முகப்பு</span>
            </Link>
            <span
              className="material-symbols-outlined text-[17px] text-[#777]"
              aria-hidden="true"
            >
              chevron_right
            </span>
            <span aria-current="page">தொடர்புகளுக்கு</span>
          </nav>

          <div className="my-auto max-w-[620px] py-10">
            <h1 className="text-[34px] font-black leading-tight text-black sm:text-[46px] lg:text-[54px]">
              தொடர்புகளுக்கு
            </h1>
            <div className="mt-4 h-1 w-16 bg-[#ef2024] sm:mt-5 sm:w-20" />
            <p className="mt-8 max-w-[580px] text-[15px] font-bold leading-8 text-[#262626] sm:mt-10 sm:text-lg sm:leading-9">
              அகரம் செய்திகள் - உண்மையை உலகாக, உங்கள் குரலை எங்களிடம்
              பகிருங்கள்.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1140px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <div className="grid gap-6 md:grid-cols-2 md:gap-9">
          {CONTACT_OPTIONS.map((contact) => (
            <article
              key={contact.email}
              className="flex min-h-[440px] flex-col items-center rounded-lg border border-[#e5e5e5] bg-white px-6 py-10 text-center shadow-[0_10px_35px_rgba(0,0,0,0.05)] sm:px-10 sm:py-12"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#fff0f1] sm:h-24 sm:w-24">
                <RedIcon
                  name={contact.icon}
                  className="text-[38px] sm:text-[44px]"
                />
              </div>

              <h2 className="mt-7 text-[22px] font-black leading-9 text-[#171717] sm:text-[25px]">
                {contact.title}
              </h2>
              <p className="mt-1 text-base font-black text-[#171717] sm:text-lg">
                ({contact.englishTitle})
              </p>
              <div className="mt-6 h-0.5 w-10 bg-[#ef2024]" />

              <a
                href={`mailto:${contact.email}`}
                className="mt-7 break-all text-[17px] font-black text-[#ef2024] transition-colors hover:text-[#bd1115] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ef2024] sm:text-xl"
              >
                {contact.email}
              </a>

              <div className="mt-8 w-full border-t border-[#e2e2e2] pt-7">
                <p className="mx-auto max-w-[390px] text-sm font-semibold leading-8 text-[#3f3f3f] sm:text-[15px]">
                  {contact.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <aside
          className="relative mt-10 overflow-hidden rounded-lg border-l-4 border-[#ef2024] bg-[#fff5f5] bg-cover bg-right bg-no-repeat px-5 py-8 sm:px-8 lg:px-10"
          style={{ backgroundImage: "url('/images/contactus%20.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#fff5f5] via-[#fff5f5]/95 to-[#fff5f5]/55" />
          <div className="relative flex max-w-[760px] flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md sm:h-20 sm:w-20">
              <RedIcon name="send" className="text-[36px] sm:text-[42px]" />
            </div>
            <div>
              <h2 className="text-lg font-black leading-8 text-[#1f1f1f]">
                உங்கள் கருத்து முக்கியம்
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
