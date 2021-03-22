module.exports = {
  purge: ['./src/**/*.html', './src/**/*.vue', './src/**/*.jsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    midWidth: {
      '1/5': '20%'
    },
    maxWidth: {
      mediaCardPreview: '15%',
      '1/4': '25%'
    }
  },
  variants: {
    extend: {
      width: ['responsive', 'hover', 'focus'],
      alignItems: ['hover', 'focus'],
      padding: ['hover', 'focus'],
      display: ['hover', 'focus']
    }
  },
  plugins: []
};
