import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      brand: 'everafter',
      navigation: {
        map: 'Map',
        tables: 'Tables',
        guests: 'Guests',
        settings: 'Settings',
      },
      actions: {
        assignGuests: 'Assign guests',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        toggleTheme: 'Toggle theme',
        profile: 'Open profile',
        tableOptions: 'Open table options',
      },
      status: {
        totalSeated: 'Total seated',
        unseated: 'Unseated',
        vips: 'VIPs',
      },
      tables: {
        title: 'Table {{number}}',
        mainHall: 'Main Hall',
        garden: 'Garden Terrace',
        lounge: 'Lounge',
        seated: '{{seated}}/{{capacity}} seated',
      },
      map: {
        title: 'Seating map',
        subtitle: 'Your reception at a glance',
      },
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
