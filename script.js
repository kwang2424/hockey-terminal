function teamsInfo(data) {
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
    return {'team_names': names, 'team_abbs': abbs, 'rosters': rosters}
}
async function matchTeam(team) {
    let obj;

    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster');

    obj = await res.json();

    let teams = teamsInfo(obj);
    let abbs = teams['team_abbs'];
    let names = teams['team_names'];
    let ratio = names.length / abbs.length;

    team = team.toLowerCase();
    name = name.toLowerCase();

    let index = -1;

    for (let i=0; i<abbs.length; i++ ) {
        if (abbs[i] == team) {
            index = i;
            break;
        }
        for (let j=0; j<ratio; j++) {
            if (names[j + ratio * i] == team) {
                index = i;
                break;
            }
        }
    }

    return index;
}
async function matchTeamPlayer(name, team) {
    let obj;

    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster');

    obj = await res.json();

    let teams = teamsInfo(obj);
    let abbs = teams['team_abbs'];
    let names = teams['team_names'];
    let ratio = names.length / abbs.length;

    team = team.toLowerCase();
    name = name.toLowerCase();

    let index = -1;

    for (let i=0; i<abbs.length; i++ ) {
        if (abbs[i] == team) {
            index = i;
            break;
        }
        for (let j=0; j<ratio; j++) {
            if (names[j + ratio * i] == team) {
                index = i;
                break;
            }
        }
    }
    let id = 0;
    let roster = teams['rosters'][index]
    for (let i=0; i<roster.length; i++) {
        console.log(roster[i]['person']['fullName']);
        if (name == roster[i]['person']['fullName'].toLowerCase()) {
            id = roster[i]['person']['id'];
        }
    }

    return id;


}

function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

$('body').terminal({
    cat: function(width, height) {
        return $('<img src="https://placekitten.com/' +
                 width + '/' + height + '">');
    },
    player: function() {
        this.push(function(name) {
            this.push(function(last_name) {
                this.push(function(team) {
                    name = name.replace(/\s/g, '');
                    last_name = last_name.replace(/\s/g, '');
                    matchTeamPlayer(name + ' ' + last_name, team)
                        .then((id) => {
                            name = toTitleCase(name);
                            last_name = toTitleCase(last_name);
                            this.echo('\n' + name + ' ' + last_name)
                            fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=careerRegularSeason`)
                            .then(res => res.json())
                            .then((data) => {
                                this.echo('\nRegular Season Stats:')
                                let keys = Object.keys(data['stats'][0]['splits'][0]['stat']);
                                let key_ind;
                                for (let i=0; i<keys.length; i++) {
                                    key_ind = keys[i]
                                    this.echo('\t' + key_ind + ': ' + data['stats'][0]['splits'][0]['stat'][key_ind]);
                                }
                            
                            })
                            fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=careerPlayoffs`)
                            .then(res => res.json())
                            .then((data) => {
                                this.echo('\nPlayoff Stats:')
                                let keys = Object.keys(data['stats'][0]['splits'][0]['stat']);
                                let key_ind;
                                for (let i=0; i<keys.length; i++) {
                                    key_ind = keys[i]
                                    this.echo('\t' + key_ind + ': ' + data['stats'][0]['splits'][0]['stat'][key_ind]);
                                }
                            
                            })
                    });

                this.pop().pop().pop();
            }, {
            prompt: 'team: '
        })  
        }, {
            prompt: 'last name: '
        })
    }, {
        prompt: 'first name: '
    })
    },
    team: function() {
        this.push(function(team) {
            matchTeam(team)
            .then((id) => {
                console.log(id);
                fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}/roster`)
                .then(res => res.json())
                .then((data) => {
                    console.log(data)
                    let jersey_num;
                    let position_abb;
                    let name;
                    
                    for (let i=0; i<data['roster'].length; i++) {
                        name = data['roster'][i]['person']['fullName']
                        jersey_num = data['roster'][i]['jerseyNumber']
                        position_abb = data['roster'][i]['position']['abbreviation']
                        this.echo(`${position_abb} - ${name} - ${jersey_num}`)
                    }

                })}
                )
            this.pop();
        }, {
            prompt: 'team: '
        })
    } 
        
}, {
    greetings: 'My First JavaScript Terminal\n'
});