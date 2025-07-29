const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add global CSS for better emoji support on web
  config.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  });

  // Import global CSS for emoji support
  config.entry = {
    ...config.entry,
    global: './global.css',
  };

  return config;
};
