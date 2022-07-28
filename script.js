function teamsInfo(data) {
    let abbs = []
    let names = []
    let name_types = ['locationName', 'name', 'shortName', 'teamName']
    let rosters = []
    let ids = []
    for (let i=0; i<data['teams'].length; i++) {
        abbs.push(data['teams'][i]['abbreviation'].toLowerCase());
        rosters.push(data['teams'][i]['roster']['roster']);
        ids.push(data['teams'][i]['id']);
        for (let j=0; j<name_types.length; j++) {
            names.push(data['teams'][i][name_types[j]].toLowerCase());
            
        }
    }
    return {'team_names': names, 'team_abbs': abbs, 'rosters': rosters, 'ids': ids}
}
async function matchTeam(team) {
    let obj;

    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster');

    obj = await res.json();

    let teams = teamsInfo(obj);
    let abbs = teams['team_abbs'];
    let names = teams['team_names'];
    let ratio = names.length / abbs.length;
    let ids = teams['ids'];

    team = team.toLowerCase();

    let index = -1;
    // console.log(abbs)
    for (let i=0; i<abbs.length; i++ ) {
        // console.log(abbs[i], team)
        if (abbs[i] == team) {
            index = ids[i];
            break;
        }
        for (let j=0; j<ratio; j++) {
            if (names[j + ratio * i] == team) {
                console.log(names[j+ratio*i])
                index = ids[i];
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
    if (index < 0) {
        return new Error("No team match.")
    }
    let id = -1;
    let roster = teams['rosters'][index]
    for (let i=0; i<roster.length; i++) {
        console.log(roster[i]['person']['fullName']);
        if (name == roster[i]['person']['fullName'].toLowerCase()) {
            id = roster[i]['person']['id'];
        }
    }
    if (id < 0) {
        return new Error("No player match.")
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
                            
                            fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=careerRegularSeason`)
                            .then(res => {
                                if (!res.ok) {
                                    throw new Error("Player not found.")
                                }
                                return res.json()
                            })
                            .then((data) => {
                                this.echo('\n' + name + ' ' + last_name)
                                this.echo('\nRegular Season Stats:')
                                let keys = Object.keys(data['stats'][0]['splits'][0]['stat']);
                                let key_ind;
                                for (let i=0; i<keys.length; i++) {
                                    key_ind = keys[i]
                                    this.echo('\t' + key_ind + ': ' + data['stats'][0]['splits'][0]['stat'][key_ind]);
                                }
                            
                            })
                            .catch((err) => this.echo("\tPlayer or team not found."))
                            
                            fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=careerPlayoffs`)
                            .then(res => {
                                if (!res.ok) {
                                    throw new Error("Player not found.")
                                }
                                return res.json()
                            }
                            )
                            .then((data) => {
                                this.echo('\nPlayoff Stats:')
                                let keys = Object.keys(data['stats'][0]['splits'][0]['stat']);
                                let key_ind;
                                for (let i=0; i<keys.length; i++) {
                                    key_ind = keys[i]
                                    this.echo('\t' + key_ind + ': ' + data['stats'][0]['splits'][0]['stat'][key_ind]);
                                }
                                this.echo();
                            
                            })
                            .catch((err) => this.echo("\tEither player not found or no playoff stats."))
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
    team: function(team) {
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
                    this.echo('');
                    for (let i=0; i<data['roster'].length; i++) {
                        name = data['roster'][i]['person']['fullName']
                        jersey_num = data['roster'][i]['jerseyNumber']
                        if (jersey_num == undefined) jersey_num = 'n/a';
                        position_abb = data['roster'][i]['position']['abbreviation']
                        this.echo(`\t${position_abb} - ${name} - ${jersey_num}`)
                    }
                    this.echo();

                })}
                )
        }
        
}, {
    greetings: 'My First JavaScript Terminal\n'
});