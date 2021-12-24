// Note: Bahalag wala ka kasabot, okay ra na madz. Basta pag refer lang ani nga boilerplate + mga existing packages sa webpack

const path = require('path')
// Not present for the end users
const webpack = require('webpack')

// copying webpack for final build
const CopyWebpackPlugin = require('copy-webpack-plugin')
// fetch CSS files from JS files and output the CSS
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// minimize image without losing quality
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const IS_DEVELOPMENT = process.env.NODE_ENV === 'dev'

const dirApp = path.join(__dirname, 'app')
const dirShared = path.join(__dirname, 'shared')
const dirStyles = path.join(__dirname, 'styles')

const dirNode = 'node_modules'

module.exports = {
  entry: [
    path.join(dirApp, 'index.js'),
    path.join(dirStyles, 'index.scss')
  ],

  // Para dili na mag sigeg ../ ../ eme eme pag mag-import, kanang diretso na siya ba
  resolve: {
    modules: [
      dirApp,
      dirShared,
      dirStyles,
      dirNode
    ]
  },

  // Note: Optimize jud as much as you can
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }]
            ]
          }
        }
      })
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      // Ang purpose sa IS_DEVELOPMENT kay restrictions gud para sa end_users/production vs development side. Murag naay specific codes nga mag work lang for development ganern
      IS_DEVELOPMENT
    }),
    // Para mag import manually daw ang purpose ani
    // new webpack.ProvidePlugin({
    //     $: 'jquery',
    // })

    // Gina-copy niya ang unod sa isa ka folder to public (for client-side). Timestamp: 39:00 video 11
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './shared',
          to: '',
          noErrorOnMissing: true
        }
      ]
    }),

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),

    new CleanWebpackPlugin()

  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },

      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },

      {
        test: /\.(jpe?g|png|gif|svg|woff2?|fnt|webp)$/,
        // Mura nig package within a package sa webpack mismo, just read the documentation kay daghan siyaaa
        loader: 'file-loader',
        options: {
          // You can add several properties pa diri like outputPath para mas specified tho
          name (file) {
            return '[name].[hash].[ext]'
          }
        }
      },

      {
        test: /\.(jpe?g|png|gif|svg|webp)$/i,
        use: [
          {
            loader: ImageMinimizerPlugin.loader
          }
        ]
      },

      {
        test: /\.(glst|frag|vert)$/,
        loader: 'raw-loader',
        exclude: /node_modules/
      },

      {
        test: /\.(glst|frag|vert)$/,
        loader: 'glslify-loader',
        exclude: /node_module/
      }
    ]
  }
}
