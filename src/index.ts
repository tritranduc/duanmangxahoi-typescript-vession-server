/* eslint-disable no-inline-comments */
import {createServer} from 'http'
import 'reflect-metadata'
import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import {ApolloServerPluginLandingPageGraphQLPlayground} from 'apollo-server-core'
import connectToDB from './util/connectToDB'
import {HelloResolver} from './resolvers/hello'
import {COOKIE_NAME} from './constraint'
import {Context} from './types/Context'
import {UserResolver} from './resolvers/User'
import {PostResolver} from './resolvers/Post'
import {LogPluginForApolloServer} from './util/logger'
import cors from 'cors'
import {AppInfoModel} from './model/appInfo'
import {AppInfoResolver} from './resolvers/AppInfo'
dotenv.config({path: path.resolve(__dirname, './.env')})
const main = async () => {
	const startTime = new Date()
	const app = express()
	const MongoUrl = process.env.DB_URL as string
	const connection = await connectToDB(MongoUrl)
	const appInfo = await AppInfoModel.findOne({})
	if (!appInfo) {
		await new AppInfoModel({}).save()
	}

	app.use(
		session({
			name: COOKIE_NAME,
			store: MongoStore.create({mongoUrl: process.env.DB_URL as string}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 12, // 1 HOURS
				httpOnly: true,
				sameSite: 'lax', // csrf
				secure: process.env.NODE_ENV === 'production', // cookie only works in https
			},
			secret: process.env.COOKIE_SECRET as string,
			resave: false,
			saveUninitialized: false,
		}),
	)
	app.use(
		cors({
			origin: (origin, callback) => {
				callback(null, true)
			},
			credentials: true,
		}),
	)
	const schema = await buildSchema({
		resolvers: [HelloResolver, UserResolver, PostResolver, AppInfoResolver],
		validate: false,
	})
	const apolloServer = new ApolloServer({
		schema,
		plugins: [
			ApolloServerPluginLandingPageGraphQLPlayground(),
			LogPluginForApolloServer,
		],
		context: ({req, res}): Context => ({req, res, connection}),
	})
	await apolloServer.start()
	apolloServer.applyMiddleware({app, cors: false})
	// disable x-powered-by header
	app.disable('x-powered-by')
	const HttpServer = createServer(app)
	const port = process.env.PORT || 4000

	app.get('/', (req, res) => {
		res.send('server is running')
	})

	HttpServer.listen(port, () => {
		// get host name and port
		let hostName = HttpServer.address()
		if (!hostName) {
			throw new Error('Host name is not found')
		}

		if (typeof hostName === 'object') {
			hostName = hostName.address
		}

		if (hostName === '::') {
			hostName = 'localhost'
		}
		// console.log(process.env.HEROKU_APP_NAME)
		console.log(
			`Server is running on port ${port} and graphgl path http://${
				process.env.NODE_ENV !== 'production'
					? hostName + ':' + port
					: process.env.HEROKU_APP_NAME + '.herokuapp.com'
			}${apolloServer.graphqlPath}`,
		)
		const endTime = new Date()
		const timeDiff = endTime.getTime() - startTime.getTime()
		console.log(`main time start is : ${timeDiff} ms`)
	})
}
main().catch(console.error)
