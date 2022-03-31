// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;
const $ = importModule("Env")
let inputValue1 = "2023 01 01 0 0 0" // The date you count from
const leftTime1 = await leftTimer(inputValue1)
let inputValue2 = "2023 01 22 0 0 0"// The date you count from
const leftTime2 = await leftTimer(inputValue2)

const User = 'user'//Your nickname
const City = 'location'//Your weather city
const WeatherKey = '' //Get from https://dev.qweather.com/
const AQIToken = '' // Get from https://aqicn.org/data-platform/token/#/
const aqi = await getAQI()
const weatherData = await getWeather()
const widget = createWidget()
Script.setWidget(widget)
Script.complete()
// widget.presentMedium()

function createWidget() {
    const w = new ListWidget()
    const bgColor = new LinearGradient()

    bgColor.colors = [new Color('#2c5364'), new Color('#203a43'), new Color('#0f2027')]
    bgColor.locations = [0.0, 0.5, 1.0]
    w.backgroundGradient = bgColor

    w.setPadding(12, 12, 12, 0)
    w.spacing = 6

    const time = new Date()

    const hour = time.getHours()
    const isMidnight = hour < 8 && 'midnight'
    const isMorning = hour >= 8 && hour < 12 && 'morning'
    const isAfternoon = hour >= 12 && hour < 19 && 'afternoon'
    const isEvening = hour >= 19 && hour < 21 && 'evening'
    const isNight = hour >= 21 && 'night'

    const dfTime = new DateFormatter()
    dfTime.locale = 'en'
    dfTime.useMediumDateStyle()
    dfTime.useNoTimeStyle()

    const Line1 = w.addText(`[🤖]Hi, ${User}. Good ${isMidnight || isMorning || isAfternoon || isEvening || isNight}`)
    Line1.textColor = new Color('#ffffff')
    Line1.font = new Font('Menlo', 11)

    const enTime = dfTime.string(time)
    const Line2 = w.addText(`[📅]Today is ${enTime}`)
    Line2.textColor = new Color('#C6FFDD')
    Line2.font = new Font('Menlo', 11)

    const Line3 = w.addText(`[☁️]${weatherData} AQI:${aqi}`)
    Line3.textColor = new Color('#FBD786')
    Line3.font = new Font('Menlo', 11)

    const Line4 = w.addText(`[${Device.isCharging() ? '⚡️' : '🔋'}]${renderBattery()} Battery`)
    Line4.textColor = new Color('#2aa876')
    Line4.font = new Font('Menlo', 11)

    const Line5 = w.addText(`[🕒]${renderYearProgress()} YearProgress`)
    Line5.textColor = new Color('#f19c65')
    Line5.font = new Font('Menlo', 11)
    
    const Line6 = w.addText(`[🐸]====距离新年还有${leftTime1[0]}天====`)
    Line6.textColor = new Color('#fff')
    Line6.font = new Font('Menlo', 11)

    const Line7 = w.addText(`[🌞]====距离春节还有${leftTime2[0]}天====`)
    Line7.textColor = new Color('#fff')
    Line7.font = new Font('Menlo', 11)

    return w
}

async function getAQI() {
  const url = `https://api.waqi.info/feed/${City}/?token=${AQIToken}`
  const request = new Request(url)
  const res = await request.loadJSON()
  return res.data.aqi
}

async function getWeather() {
  const requestCityInfo = new Request(
      `https://geoapi.heweather.net/v2/city/lookup?key=${WeatherKey}&location=${City}&lang=en`
  )
  const resCityInfo = await requestCityInfo.loadJSON()
  const { name, id } = resCityInfo.location[0]

  const requestNow = new Request(`https://devapi.heweather.net/v7/weather/now?location=${id}&key=${WeatherKey}&lang=en`)
  const requestDaily = new Request(`https://devapi.heweather.net/v7/weather/3d?location=${id}&key=${WeatherKey}&lang=en`)
  const resNow = await requestNow.loadJSON()
  const resDaily = await requestDaily.loadJSON()

  return `${name} ${resNow.now.text} T:${resNow.now.temp}° H:${resDaily.daily[0].tempMax}° L:${resDaily.daily[0].tempMin}°`
}

function renderProgress(progress) {
    const used = '▓'.repeat(Math.floor(progress * 24))
    const left = '░'.repeat(24 - used.length)
    return `${used}${left} ${Math.floor(progress * 100)}%`
}

function renderBattery() {
    const batteryLevel = Device.batteryLevel()
    return renderProgress(batteryLevel)
}

function renderYearProgress() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1) // Start of this year
    const end = new Date(now.getFullYear() + 1, 0, 1) // End of this year
    const progress = (now - start) / (end - start)
    return renderProgress(progress)
}

async function leftTimer(inputValue){ 
    if ( inputValue != "0 0 0 0 0 0" ) {
      if( $.setdata('Time', inputValue) ){
        log('clear:' + inputValue)
      }
    } else if ( $.hasdata('Time') ) {
      inputValue = $.getdata('Time')
      log('get:' + inputValue)
    } else {
      inputValue = await $.input('目标时间', '年 月 日 时 分 秒，用空格隔开', '例如：2020 12 31 0 0 0')
      if($.setdata('Time', inputValue)) {
        log('success:' + inputValue)
      }
    }
  
    let targetTime = inputValue.split(" ");
    var leftTime = (new Date(targetTime[0], targetTime[1]-1, targetTime[2], targetTime[3], targetTime[4], targetTime[5])) - (new Date()); //计算剩余的毫秒数 
    var days = parseInt(leftTime / 1000 / 60 / 60 / 24 , 10); //计算剩余的天数 
    var hours = parseInt(leftTime / 1000 / 60 / 60 % 24 , 10); //计算剩余的小时 
    var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
    var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 
  
    var leftTime=new Array();
    leftTime[0] = checkTime(days); 
    leftTime[1] = checkTime(hours); 
    leftTime[2] = checkTime(minutes); 
    leftTime[3] = checkTime(seconds); 
    
    log(leftTime)
    return leftTime
  } 
  
  function checkTime(i) { //将0-9的数字前面加上0，例1变为01 
      if(i<10) { 
           i = "0" + i; 
       }
       return i; 
  } 