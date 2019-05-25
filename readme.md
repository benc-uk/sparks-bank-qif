# M&S Bank Statement QIF Converter
This is a *very* specific project!

It reads Marks & Spencer's bank statements in PDF format and converts them to QIF to be imported into Microsft Money or other finance software. That's all it does 😄

It's written in Node/JavaScript so will require the [Node.js runtime installed](https://nodejs.org/en/download/)

### Usage
```
node run.js {filename.pdf}
```
If no filename is provided then **statement.pdf** will be used. The resulting QIF will be written to **output.qif**