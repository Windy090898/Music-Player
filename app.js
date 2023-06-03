const url = 'https://deezerdevs-deezer.p.rapidapi.com/search?q=Wanna%20One';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '96a1a5fbc7mshac9d3e8177462ddp184314jsn99893c8c5e4b',
		'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
	}
};

async function fetchUrl() {
    try {
        const response = await fetch(url, options);
        const result = await response.text();
        // console.log(result);
        return result;
        
    } catch (error) {
        console.error(error);
    }
}

