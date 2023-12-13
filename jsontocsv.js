const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const json2csv = require('json2csv').Parser;

const url = 'https://news.ycombinator.com/';


const fetchdata = async () => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const parsedata = (html) => {
  const $ = cheerio.load(html);
  const newsItems = [];
 
  $('table tr.athing').each((index, element) => {
        const rank = $(element).find('span.rank').text();
        const title = $(element).find('a').text();

        const comments = parseInt($(element).next().find('span.score').text().trim(), 10) || 0;
    newsItems.push({title,rank,comments});
  });

  return newsItems;
};

const groupByCommentRange = (data) => {
  const groupeddata = {
    '0-100': [],
    '101-200': [],
    '201-300': [],
    '301-n': [],
  };

data.forEach((item) => {
    if (item.comments >= 0 && item.comments <= 100) {
      groupeddata['0-100'].push(item);
    } else if (item.comments >= 101 && item.comments <= 200) {
      groupeddata['101-200'].push(item);
    } else if (item.comments >= 201 && item.comments <= 300) {
      groupeddata['201-300'].push(item);
    } else {
      groupeddata['301-n'].push(item);
    }
  });
       

  return groupeddata;
};

const exportToJSON = (data) => {
  fs.writeFileSync('news_data.json', JSON.stringify(data, null, 2));
  console.log('Exported to news_data.json');
};

const exportToCSV = (data) => {
  const json2csvParser = new json2csv();
  const csv = json2csvParser.parse(data);

  fs.writeFileSync('news_data.csv', csv);
  console.log('Exported to news_data.csv');
};

(async () => {
  try {
    const html = await fetchdata();
    const newsdata = parsedata(html);
    const groupeddata = groupByCommentRange(newsdata);

    exportToJSON(groupeddata);
    exportToCSV(groupeddata);
  } catch (error) {
    console.error('Error:', error.message || error);
  }
})();
