require('./db')

const express=require('express')
const userRoute = require('./routes/userRoute');
const mylostRoute=require('./routes/mylostRoute');
const lostRoute=require('./routes/lostRoute');
const env=require("dotenv")
const cors = require('cors');
const bodyParser=require('body-parser')
const morgan=require('morgan')
const rateLimit=require('express-rate-limit')
const helmet=require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression')
const publicerror=require('./controller/errors')
env.config({path:'config.env'})

const app=express();


app.use(cors({
    origin:"*",
    
})
);

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });
  
  
 app.use(cookieParser());

// Set security HTTP headers
app.use(helmet());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))

}
// Limit requests from same API
const limiter = rateLimit({
  max: 200,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
//app.use('/api', limiter);
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression())
 
app.use(express.json({ limit: '20kb' }));
app.use(["/api/user"], userRoute);
app.use(["/api/mylost"], mylostRoute);
app.use(["/api/lost"], lostRoute);


//api error handling 
app.all('*', (req, res, next) => {
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
  }

  );

    app.use(publicerror)

const PORT=process.env.PORT 
app.listen(PORT,()=>{
    console.log("server running...")
})
// Handle rejection outside express
process.on('unhandledRejection', (err) => {
    console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
    server.close(() => {
      console.error(`Shutting down....`);
      process.exit(1);
    });
  });
