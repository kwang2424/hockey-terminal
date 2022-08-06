let teamsInfo = (data) => {
    let abbs = []
    let names = []
    let name_types = ['locationName', 'name', 'shortName', 'teamName']
    let rosters = []
    for (let i=0; i<data['teams'].length; i++) {
        abbs.push(data['teams'][i]['abbreviation'].toLowerCase());
        rosters.push(data['teams'][i]['roster']['roster']);
        for (let j=0; j<name_types.length; j++) {
            names.push(data['teams'][i][name_types[j]].toLowerCase());
            
        }
    }
    console.log(names);
    console.log(rosters[0][0]['person']['fullName']);
    console.log(abbs);  
}

let tweakData = (data) => {
    console.log(data)
}
fetch('https://statsapi.web.nhl.com/api/v1/divisions')
    .then(jsonData => jsonData.json())
    .then(data => console.log(data))





