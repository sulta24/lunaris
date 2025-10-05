// app/about/page.tsx
import React from "react";

export default function AboutPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lunaris AI",
    url: "https://theLunaris.com",
    logo: "https://theLunaris.com/logo.png",
    description:
      "Lunaris AI - революционная платформа для общения с цифровыми двойниками космических легенд. Изучайте космос через диалог с великими исследователями.",
    sameAs: [
      "https://www.instagram.com/Lunaris",
      "https://www.linkedin.com/company/Lunaris",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Алматы",
      addressRegion: "Алматинская область",
      addressCountry: "KZ",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+7-777-777-7777",
        contactType: "customer service",
      },
    ],
    areaServed: [
      { "@type": "Place", name: "Казахстан" },
      { "@type": "Place", name: "Россия" },
      { "@type": "Place", name: "СНГ" },
    ],
  };

  return (
    <>
      {/* SEO Schema for Google + LLMs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />

      {/* Hero Section */}
      <section className="relative bg-black text-white py-20 px-6 md:px-12 lg:px-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          О Lunaris AI
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-80">
          Революционная платформа для изучения космоса через общение с цифровыми двойниками великих космонавтов и ученых
        </p>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-neutral-900 text-white px-6 md:px-12 lg:px-20">
        <div className="grid gap-12 md:grid-cols-3">
          {[
            {
              title: "ИИ-технологии",
              desc: "Передовые алгоритмы машинного обучения для создания реалистичных диалогов с историческими личностями.",
            },
            {
              title: "Голосовое взаимодействие",
              desc: "Современные технологии распознавания и синтеза речи для естественного общения с персонажами.",
            },
            {
              title: "RAG-система",
              desc: "Retrieval-Augmented Generation обеспечивает точные и достоверные ответы на основе исторических данных.",
            },
            {
              title: "Образовательная миссия",
              desc: "Делаем изучение космоса интерактивным и увлекательным для нового поколения исследователей.",
            },
            {
              title: "Историческая точность",
              desc: "Каждый персонаж основан на реальных фактах, воспоминаниях и документах космических миссий.",
            },
            {
              title: "Инновационный подход",
              desc: "Сочетаем современные технологии с богатой историей освоения космоса.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-neutral-800 p-6 rounded-2xl shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="opacity-80">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-black text-white px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Наши технологии
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-neutral-900 p-6 rounded-2xl">
              <h3 className="text-2xl font-semibold mb-4 text-lime-300">
                Искусственный интеллект
              </h3>
              <p className="opacity-80 mb-4">
                Используем передовые модели GPT и собственные алгоритмы для создания персонажей, которые могут поддерживать глубокие диалоги о космосе, науке и истории исследований.
              </p>
              <ul className="list-disc list-inside opacity-70 space-y-1">
                <li>Обработка естественного языка</li>
                <li>Контекстуальное понимание</li>
                <li>Персонализированные ответы</li>
              </ul>
            </div>
            
            <div className="bg-neutral-900 p-6 rounded-2xl">
              <h3 className="text-2xl font-semibold mb-4 text-lime-300">
                Мультимедийные технологии
              </h3>
              <p className="opacity-80 mb-4">
                Интегрируем видео, аудио и интерактивные элементы для создания полноценного опыта общения с историческими личностями.
              </p>
              <ul className="list-disc list-inside opacity-70 space-y-1">
                <li>Синтез речи в реальном времени</li>
                <li>Распознавание голосовых команд</li>
                <li>Видео-интеграция</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-neutral-900 text-white px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Наша миссия
          </h2>
          <p className="text-lg opacity-80 mb-8">
            Мы верим, что изучение космоса должно быть доступным и увлекательным. 
            Через диалог с великими космонавтами и учеными мы вдохновляем новое поколение 
            исследователей и делаем сложные научные концепции понятными каждому.
          </p>
          <div className="grid gap-6 md:grid-cols-3 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-lime-300 mb-2">5+</div>
              <p className="opacity-70">Космических легенд</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-lime-300 mb-2">1000+</div>
              <p className="opacity-70">Часов контента</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-lime-300 mb-2">∞</div>
              <p className="opacity-70">Возможностей обучения</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-center text-white px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Готовы исследовать космос?
        </h2>
        <p className="text-lg opacity-80 mb-8">
          Начните свое путешествие с разговора с легендами космонавтики
        </p>
        <a
          href="/"
          className="bg-lime-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-lime-300 transition-all text-lg"
        >
          Начать исследование
        </a>
      </section>
    </>
  );
}
