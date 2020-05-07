const superagent = require("superagent");
const TelegramBot = require("node-telegram-bot-api");

const http = require("http");

const server = http.createServer((req, res) => {
  res.end();
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Our app is running on port ${PORT}`));


// Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.

const bot = new TelegramBot(TOKEN, {polling: true});
// telegram.on("text", (message) => {
//   telegram.sendMessage(message.chat.id, "Hello world");
//   console.log(message);
// });

//get weatherinfo
//
// Template for weather response
const weatherHtmlTemplate = (name, main, weather, wind, clouds, sys) =>
  `
  The weather in <b>${name}</b>:
  Sky: <b>${weather.main}, ${weather.description}</b>
  Temperature: <b>${main.temp} °C</b>
  Pressure: <b>${main.pressure} hPa</b>
  Humidity: <b>${main.humidity} %</b>
  Wind: <b>${wind.speed}m/s (${wind.deg} deg)</b>
  
  Clouds: <b>${clouds.all} %</b>
  Sunrise: <b>${new Date(sys.sunrise * 1000 + 5.5 * 60 * 60 * 1000)
    .toTimeString()
    .replace(/ GMT.*/gis, "")} </b>
  Sunset: <b>${new Date(sys.sunset * 1000 + 5.5 * 60 * 60 * 1000)
    .toTimeString()
    .replace(/ GMT.*/gis, "")} </b>
  `;

// OpenWeatherMap endpoint for getting weather by city name
const weatherEndpoint = (city) =>
  `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${API}`;

// URL that provides icon according to the weather
const weatherIcon = (icon) => `http://openweathermap.org/img/w/${icon}.png`;

bot.onText(/\/weather/, (msg, match) => {
  const chatId = msg.chat.id;
  const city = match.input.split(" ")[1];
  if (city === undefined) {
    bot.sendMessage(chatId, `Please provide city name`);
    return;
  } else {
    (async function () {
      try {
        const response = await superagent.get(weatherEndpoint(city));
        const weatherData = JSON.parse(response.text);
        const {name, main, weather, wind, clouds, sys} = weatherData;

        //   bot.sendPhoto(chatId, weatherIcon(weather[0].icon));
        bot.sendMessage(chatId, weatherHtmlTemplate(name, main, weather[0], wind, clouds, sys), {
          parse_mode: "HTML",
        });
      } catch (err) {
        bot.sendMessage(chatId, `Ooops...I couldn't be able to get weather for <b>${city}</b>`, {
          parse_mode: "HTML",
        });
      }
    })();
  }
});

// Listener (handler) for telegram's /start event
// This event happened when you start the conversation with both by the very first time
// Provide the list of available commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Welcome at <b>My Weather Info Bot</b>
      
  Available commands:
  
  /weather <b>&lt;city_name&gt;</b> : shows weather for selected city.
    `,
    {
      parse_mode: "HTML",
    }
  );
});
