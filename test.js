let teamsInfo = (data) => {
    let abbs = []
    let names = []
    let name_types = ['locationName', 'name', 'shortName', 'teamName']
    for (let i=0; i<data['teams'].length; i++) {
        abbs.push(data['teams'][i]['abbreviation'].toLowerCase());
        for (let j=0; j<name_types.length; j++) {
            names.push(data['teams'][i][name_types[j]].toLowerCase());
            
        }
    }
    console.log(names);
    console.log(abbs);  
}

fetch('https://statsapi.web.nhl.com/api/v1/teams')
    .then(jsonData => jsonData.json())
    .then(data => teamsInfo(data))





