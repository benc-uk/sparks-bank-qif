const qif = require('qif');	
const fs = require('fs');
const pdf = require('pdf-parse');

// Check param inputs
let inputPdf = 'statement.pdf';
if(process.argv[2]) {
  console.log("Note! No input PDF specified, will use statement.pdf");
  inputPdf = process.argv[2];
}
var transactions = { cash: [] };

console.log(`Processing PDF '${inputPdf}'`);

// Load PDF and convert to text
let pdfBuffer = fs.readFileSync(inputPdf);
pdf(pdfBuffer)
.then(pdf => {
  //console.log(pdf.text);
  // Horrific regex
  let pdfRegex = /\d\d\s\D\w\w\s\d.*?£[\d,]+\.\d\d(\sCR)?/mgi;
  // Run PDF text through regex
  let pdfMatches = pdf.text.match(pdfRegex)
  if(!pdfMatches || pdfMatches.length <= 0) {
    console.log(`Regex match failure on whole text, this probably isn't an M&S bank statement!`);
    process.exit(1);
  }
  console.log(`Found ${pdfMatches.length} transactions in PDF statement`);
  
  for(let transLine of pdfMatches) {
    
    // Another horrific regex
    // Capture four groups, date1, date2, payee and amount
    let transRegex = /(\d\d \w\w\w \d\d)\s(\d\d \w\w\w \d\d)\s(.*?)£(.*?)$/i
    let transMatches = transLine.match(transRegex);
    if(!transMatches || transMatches.length <= 0) {
      console.log(`Regex match failure on transactions, this probably isn't an M&S bank statement!`);
      process.exit(1);
    }

    let amount = 0;
    // Handle credits (with CR at the end of the amount)
    if(transMatches[4].lastIndexOf('CR') >= 0) {
      amount = transMatches[4].substr(0, transMatches[4].length-2);
    } else {
      amount = -transMatches[4];
    }
    amount = (amount+"").replace(',', '');
    
    // Note match[0] is not any use, so captured groups start at 1
    transactions.cash.push({
      date: parseDate(transMatches[2]),    
      payee: transMatches[3],   
      amount: amount, 
    });
    console.log(`##### ${parseDate(transMatches[2])}\t${amount}\t\t${transMatches[3]}`);
  }

  // Write output file
  qif.writeToFile(transactions, './output.qif', function (err, qifData) {
    if(err) {
      console.log(`Error writing QIF`);
    } else {
      console.log(`Written QIF file to output.qif`);
    }
  });
})
.catch(err => {
  console.log(`${err}`);
  console.log(`Error converting PDF to text, maybe it's not a PDF? ${err}`);
});

function parseDate(s) {
  var months = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,
                jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
  var p = s.split(' ');
  
  // Hardcoded 20 in front of year!
  return p[0] + '/' + months[p[1].toLowerCase() ] +'/20' + p[2];
}