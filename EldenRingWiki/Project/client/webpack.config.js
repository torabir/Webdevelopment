const path = require('path');

module.exports = {
  entry: './src/index.tsx', // Initial file to bundle
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  output: {
    // Output file: ./public/bundle.js
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
  },
  // Makes original source code available to the browser for easier identification of error causes.
  devtool: 'source-map',
  module: {
    rules: [
      {
        // Use babel to parse .tsx files in the src folder
        test: /\.tsx$/,
        include: path.resolve(__dirname, 'src'),
        use: ['babel-loader'],
      },
      {
        // Rule for handling PNG and JPG images
        test: /\.(png|jpe?g)$/, // Match both PNG and JPG/JPEG formats
        include: path.resolve(__dirname, 'src/images'), // Adjust path to where your images are stored
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[ext]', // Save images in 'public/images'
              outputPath: 'images/', // Output directory for images in the public folder
              publicPath: '/images/', // Public path so CSS references are correct
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
