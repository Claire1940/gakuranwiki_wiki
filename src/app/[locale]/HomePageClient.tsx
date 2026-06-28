"use client";

import { useState, Suspense, lazy } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Gift,
  Keyboard,
  Lightbulb,
  Link as LinkIcon,
  Map as MapIcon,
  Swords,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Conditionally render text as a link or plain span
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: React.ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

// Tools Grid 卡片 -> 模块锚点映射（8 张卡片，各不相同）
const TOOLS_SECTION_IDS = [
  "gakuran-codes",
  "gakuran-official-links",
  "gakuran-beginner-guide",
  "gakuran-controls",
  "gakuran-fighting-styles",
  "gakuran-combat-guide",
  "gakuran-map-guide",
  "gakuran-updates",
];

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.gakuranwiki.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Gakuran Wiki",
        description:
          "Complete Gakuran Wiki covering Roblox codes, PvP guide, fighting styles, controls, map notes, updates, and beginner tips for the Japanese school brawler.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Gakuran - Roblox School Brawler RP",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Gakuran Wiki",
        alternateName: "Gakuran",
        url: siteUrl,
        description:
          "Complete Gakuran Wiki resource hub for Roblox codes, PvP guide, fighting styles, controls, map, and updates",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Gakuran Wiki - Roblox School Brawler",
        },
        sameAs: [
          "https://www.roblox.com/games/128736949265057/Gakuran",
          "https://www.roblox.com/communities/416091513/Gakuran",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Gakuran",
        gamePlatform: ["PC", "Mac", "Mobile", "Roblox"],
        applicationCategory: "Game",
        genre: ["Action", "Battlegrounds & Fighting", "Roleplay"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 50,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/128736949265057/Gakuran",
        },
      },
      {
        "@type": "VideoObject",
        name: "Welcome to Nishikata High, the WORST School in Japan",
        description:
          "Featured Gakuran gameplay video showcasing the Japanese school-town brawler roleplay experience on Roblox.",
        uploadDate: "2024-06-01",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/xJ4jAPJhkYM",
        url: "https://www.youtube.com/watch?v=xJ4jAPJhkYM",
      },
    ],
  };

  // FAQ accordion state (combat guide module)
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("gakuran-codes")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Gift className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/128736949265057/Gakuran"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 区域 */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="xJ4jAPJhkYM"
              title="Welcome to Nishikata High, the WORST School in Japan"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（视频之后、Latest Updates 之前） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = TOOLS_SECTION_IDS[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* Module 1: Gakuran Codes */}
      <section id="gakuran-codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Gift className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["gakuranCodes"]}
                  locale={locale}
                >
                  {t.modules.gakuranCodes.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gakuranCodes.subtitle}
            </p>
          </div>

          {/* Code status cards */}
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 md:mb-10">
            <div className="p-5 md:p-6 bg-white/5 border border-border rounded-xl">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t.modules.gakuranCodes.statusLabel}
              </h3>
              <p className="text-sm md:text-base font-medium">
                {t.modules.gakuranCodes.statusValue}
              </p>
            </div>
            <div className="p-5 md:p-6 bg-white/5 border border-border rounded-xl">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t.modules.gakuranCodes.activeLabel}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                {t.modules.gakuranCodes.activeEmpty}
              </p>
            </div>
            <div className="p-5 md:p-6 bg-white/5 border border-border rounded-xl">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t.modules.gakuranCodes.expiredLabel}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                {t.modules.gakuranCodes.expiredEmpty}
              </p>
            </div>
          </div>

          {/* Redeem steps */}
          <div className="scroll-reveal p-5 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">
                {t.modules.gakuranCodes.redeemLabel}
              </h3>
            </div>
            <ol className="space-y-3">
              {t.modules.gakuranCodes.redeemSteps.map(
                (step: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.2)] border border-[hsl(var(--nav-theme)/0.5)] text-xs font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                    <span className="text-sm md:text-base text-muted-foreground">
                      {step}
                    </span>
                  </li>
                ),
              )}
            </ol>
          </div>

          {/* Where new codes appear (plain labels, no source links) */}
          <div className="scroll-reveal flex flex-wrap gap-3 justify-center">
            <span className="w-full text-center text-xs uppercase tracking-wider text-muted-foreground mb-1">
              {t.modules.gakuranCodes.watchLabel}
            </span>
            {t.modules.gakuranCodes.watchSources.map(
              (source: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm"
                >
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                  {source}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Gakuran Official Links */}
      <section
        id="gakuran-official-links"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <LinkIcon className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["gakuranOfficialLinks"]}
                  locale={locale}
                >
                  {t.modules.gakuranOfficialLinks.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gakuranOfficialLinks.subtitle}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.gakuranOfficialLinks.cards.map((card: any, index: number) => (
              <a
                key={index}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors block"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-lg text-[hsl(var(--nav-theme-light))]">
                    <LinkedTitle
                      linkData={
                        moduleLinkMap[`gakuranOfficialLinks::cards::${index}`]
                      }
                      locale={locale}
                    >
                      {card.name}
                    </LinkedTitle>
                  </h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(var(--nav-theme-light))] flex-shrink-0 mt-1 transition-colors" />
                </div>
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-3">
                  {card.type}
                </span>
                <p className="text-sm text-muted-foreground mb-3">
                  {card.description}
                </p>
                {card.details && card.details.length > 0 && (
                  <ul className="space-y-1">
                    {card.details.map((d: string, di: number) => (
                      <li
                        key={di}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Module 3: Gakuran Beginner Guide */}
      <section id="gakuran-beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["gakuranBeginnerGuide"]}
                  locale={locale}
                >
                  {t.modules.gakuranBeginnerGuide.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gakuranBeginnerGuide.subtitle}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {t.modules.gakuranBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[`gakuranBeginnerGuide::steps::${index}`]
                        }
                        locale={locale}
                      >
                        {step.title}
                      </LinkedTitle>
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Check className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.gakuranBeginnerGuide.tips.map(
                (tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 4: Gakuran Controls and Keybinds */}
      <section
        id="gakuran-controls"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Keyboard className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["gakuranControls"]}
                  locale={locale}
                >
                  {t.modules.gakuranControls.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gakuranControls.subtitle}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.gakuranControls.controls.map(
              (control: any, index: number) => (
                <div
                  key={index}
                  className="p-4 md:p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <h3 className="font-bold text-base md:text-lg mb-3 flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                    <LinkedTitle
                      linkData={
                        moduleLinkMap[`gakuranControls::controls::${index}`]
                      }
                      locale={locale}
                    >
                      {control.action}
                    </LinkedTitle>
                  </h3>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground w-32 flex-shrink-0">
                        Keyboard & Mouse
                      </dt>
                      <dd>{control.keyboard}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground w-32 flex-shrink-0">
                        Mobile
                      </dt>
                      <dd>{control.mobile}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground w-32 flex-shrink-0">
                        Controller
                      </dt>
                      <dd>{control.controller}</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                    {control.notes}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 5: Gakuran Fighting Styles Tier List */}
      <section id="gakuran-fighting-styles" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Swords className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["gakuranFightingStyles"]}
                  locale={locale}
                >
                  {t.modules.gakuranFightingStyles.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gakuranFightingStyles.subtitle}
            </p>
          </div>

          <div className="scroll-reveal space-y-5 md:space-y-6 mb-6 md:mb-8">
            {t.modules.gakuranFightingStyles.tiers.map(
              (tier: any, index: number) => {
                const style = tier.styles[0];
                return (
                  <div
                    key={index}
                    className="p-5 md:p-6 bg-white/5 border border-border rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme))] text-white text-xl font-bold">
                        {tier.tier}
                      </span>
                      <div>
                        <h3 className="font-bold text-lg text-[hsl(var(--nav-theme-light))]">
                          <LinkedTitle
                            linkData={
                              moduleLinkMap[`gakuranFightingStyles::tiers::${index}`]
                            }
                            locale={locale}
                          >
                            {tier.label}
                          </LinkedTitle>
                        </h3>
                        <p className="text-sm text-muted-foreground">{style.role}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mb-4 p-4 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] rounded-lg">
                      <DynamicIcon
                        name={style.icon}
                        className="h-6 w-6 mt-0.5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]"
                      />
                      <div>
                        <p className="font-semibold text-base mb-1">{style.name}</p>
                        <p className="text-sm text-muted-foreground">{style.bestFor}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06]">
                        <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2 font-semibold">
                          Strengths
                        </p>
                        <ul className="space-y-1.5">
                          {style.strengths.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06]">
                        <p className="text-xs uppercase tracking-wider text-amber-400 mb-2 font-semibold">
                          Watch Out For
                        </p>
                        <ul className="space-y-1.5">
                          {style.weaknesses.map((w: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <DynamicIcon
                        name="Target"
                        className="w-4 h-4 mt-0.5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]"
                      />
                      <span>
                        <span className="font-medium text-foreground">Practice: </span>
                        {style.practice}
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          <p className="scroll-reveal text-center text-sm text-muted-foreground italic">
            {t.modules.gakuranFightingStyles.note}
          </p>
        </div>
      </section>

      {/* Module 6: Gakuran Combat Guide (FAQ) */}
      <section
        id="gakuran-combat-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Zap className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["gakuranCombatGuide"]}
                  locale={locale}
                >
                  {t.modules.gakuranCombatGuide.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gakuranCombatGuide.subtitle}
            </p>
          </div>

          <div className="scroll-reveal space-y-2">
            {t.modules.gakuranCombatGuide.faqs.map(
              (faq: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden bg-white/[0.02]"
                >
                  <button
                    onClick={() =>
                      setFaqExpanded(faqExpanded === index ? null : index)
                    }
                    className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      <DynamicIcon
                        name={faq.icon}
                        className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                      />
                    </span>
                    <span className="font-semibold pr-4 flex-1">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${faqExpanded === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {faqExpanded === index && (
                    <div className="px-5 pb-5 pt-1">
                      <p className="text-muted-foreground text-sm mb-4">{faq.answer}</p>
                      <ul className="space-y-2 mb-4">
                        {faq.details.map((d: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="overflow-hidden rounded-lg border border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[hsl(var(--nav-theme)/0.08)] text-left">
                              <th className="px-3 py-2 font-semibold">Action</th>
                              <th className="px-3 py-2 font-semibold">PC</th>
                              <th className="px-3 py-2 font-semibold">Controller</th>
                            </tr>
                          </thead>
                          <tbody>
                            {faq.controls.map((c: any, ci: number) => (
                              <tr key={ci} className="border-t border-border">
                                <td className="px-3 py-2 font-medium">{c.action}</td>
                                <td className="px-3 py-2 text-muted-foreground">{c.pc}</td>
                                <td className="px-3 py-2 text-muted-foreground">
                                  {c.controller}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 7: Gakuran Map and School RP Guide */}
      <section id="gakuran-map-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <MapIcon className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["gakuranMapGuide"]}
                  locale={locale}
                >
                  {t.modules.gakuranMapGuide.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gakuranMapGuide.subtitle}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.gakuranMapGuide.areas.map((area: any, index: number) => {
              const riskStyles: Record<string, string> = {
                High: "text-amber-300 border-amber-500/40 bg-amber-500/10",
                Medium: "text-sky-300 border-sky-500/40 bg-sky-500/10",
                Low: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
              };
              const riskClass = riskStyles[area.risk] || riskStyles.Medium;
              return (
                <div
                  key={index}
                  className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      <DynamicIcon
                        name={area.icon}
                        className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                      />
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border font-medium ${riskClass}`}
                    >
                      {area.risk} PvP Risk
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] w-fit mb-2">
                    {area.type}
                  </span>
                  <h3 className="font-bold mb-2">
                    <LinkedTitle
                      linkData={moduleLinkMap[`gakuranMapGuide::areas::${index}`]}
                      locale={locale}
                    >
                      {area.name}
                    </LinkedTitle>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{area.description}</p>
                  <div className="mt-auto flex items-start gap-2 pt-3 border-t border-border text-sm">
                    <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                    <span className="text-muted-foreground">{area.tip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module 8: Gakuran Updates, Release Date and Player Stats */}
      <section
        id="gakuran-updates"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Clock className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["gakuranUpdates"]}
                  locale={locale}
                >
                  {t.modules.gakuranUpdates.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gakuranUpdates.subtitle}
            </p>
          </div>

          {/* Stats grid */}
          <div className="scroll-reveal grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
            {t.modules.gakuranUpdates.stats.map((stat: any, index: number) => (
              <div
                key={index}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl text-center"
              >
                <DynamicIcon
                  name={stat.icon}
                  className="w-6 h-6 text-[hsl(var(--nav-theme-light))] mx-auto mb-2"
                />
                <p className="text-2xl md:text-3xl font-bold text-[hsl(var(--nav-theme-light))]">
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Info list */}
          <div className="scroll-reveal p-5 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl mb-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {t.modules.gakuranUpdates.info.map((item: any, index: number) => (
                <div key={index} className="flex flex-col">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="text-sm md:text-base font-medium">{item.value}</dd>
                  {item.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.details}
                    </p>
                  )}
                </div>
              ))}
            </dl>
          </div>

          <p className="scroll-reveal text-center text-sm text-muted-foreground italic">
            {t.modules.gakuranUpdates.updateNote}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner end */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/games/128736949265057/Gakuran"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGame}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/416091513/Gakuran"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/gakuran"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
