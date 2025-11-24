import '../src/index.css';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0B0B0F',
        },
        {
          name: 'surface',
          value: '#101014',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="dark p-8">
        <Story />
      </div>
    ),
  ],
};

export default preview;
