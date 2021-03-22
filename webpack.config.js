const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');

module.exports = (env, argv) => {
  return {
    mode: process.env.NODE_ENV,
    entry: path.resolve(__dirname, './src/index.jsx'),
    output: {
      publicPath: '/',
      path: path.join(__dirname, 'build'),
      filename: 'bundle.js'
    },
    devServer: {
      // publicPath: '/',
      open: true,
      historyApiFallback: true,
      proxy: {
        '/': 'http://localhost:4000'
      },
      hot: true
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.jsx?$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      targets: {
                        node: '12'
                      }
                    }
                  ],
                  '@babel/preset-react'
                ]
              }
            }
          ]
        },
        {
          test: /\.css$/i,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
            },
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'url-loader'
            }
          ]
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'svg-url-loader'
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './src/index.html')
      }),
      new HotModuleReplacementPlugin()
    ]
  };
};
