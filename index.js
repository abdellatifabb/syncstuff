const express = require('express');


const app = express();
const PORT = process.env.PORT || 3000;


const axios = require('axios')


const bodyParser = require('body-parser');

app.use(bodyParser.json());

const codInAfricaKeys = {
  "api_key":"qgwyfr40hyxnvgj57jd4kgcb3c9awlkbikcqmarj",
  "api_secret":"cfpfnirquwyaqaqqhsoqdn4ilrjdh86pseaj25w9"
}

const availableCountries = {
    "ang":"AO",
    "kn":"KE",
    "tcd":"TD",
    "bf":"BF",
    "bn":"BJ",
    "tg":"TG",
    "ma":"MA",
    "gm":"GM",
    "ng":"NE",
    "gb":"GA",
    "sn":"SN",
    "civ":"CI"
}



async function sendOrderToCodInAfrica(order){
  try{
    const country = order.url.split('-')[order.url.split('-').length-1]
    const product = JSON.parse(order.sku.replace(/'/g,`"`))
   
    let insertObj =  {
        "orderId":`omana-${country}-order-${order.id}-2023`,
        "source":"Omana",
        "fullName": order.name,
        "phone": order.phone,
        "country": availableCountries[country],
        "city": order.city,
        "address": order.city,
        "items":[
            {
                "name": product[1],
                "code": product[2],
                "quantity": parseInt(order.quantity),
                "price": parseInt(order.price)
            }
        ],
        "total": parseInt(order.price) * parseInt(order.quantity)
    }
    const resInsert = await axios.post(`https://api.codinafrica.com/api/orders/apicreate?key=${codInAfricaKeys.api_key}&secret=${codInAfricaKeys.api_secret}&source=Omana`,insertObj)

    console.log("resInsert")
  }
  catch(err){
    sendErrorToDiscord(err,order)
  }

}

async function sendErrorToDiscord(err,order,service = "CodInAfrica"){
  console.log("------------ Oder Faailed ---------",order.id)
  console.log("Errror",err)
  const obj = {
    "username": "Omana Shop",
    "content": `Order: 🤷‍♂️ [${order.id}] (${service}) 🤷‍♂️ Failed 🆘. and the error was (${err.message})`,
    "avatar_url": ""
  }
  const sendHook = await axios.post("https://discord.com/api/webhooks/1147220868213264495/KowXtBtfaT2z3MdvFlM8TyeDwP081MbZNU-LXB_mm37hWp0HSxlnRFKyJc1XOnLBj9nn",obj)
}

app.get('/test', (req,res)=>{
  console.log("Hello");
});

app.post('/webhook', (req, res) => {
    let body = req.body;
    console.log('Request body:', body);

    sendOrderToCodInAfrica(body)
    
    res.sendStatus(200); // Send a response to acknowledge the webhook
});


// Set up the webhook and start the server
app.listen(PORT,"0.0.0.0",() => {
  console.log(`Server is running on port ${PORT}`);
});