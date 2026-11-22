import rss from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'Cabinet de Dermatologie Dr Siham OUMAKHIR',
    description: 'Actualités et conseils dermatologiques du cabinet à Marrakech',
    site: context.site,
    items: [
      {
        title: 'Nouveau : Réservation en ligne disponible',
        link: '/#contact',
        pubDate: new Date(),
        description: 'Prenez rendez-vous facilement via WhatsApp ou notre formulaire en ligne.'
      }
    ],
    customData: `<language>fr</language>`,
  });
}