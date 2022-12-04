# Getter and Setter Generator
### Extension for Visual Studio Code 
This extension generate get and set methods from the class variable declarations.

## Usage
![how use](https://raw.githubusercontent.com/afmicc/getter-setter-generator/master/readme/v1.0.0.gif)

## Authors

* afmicc - Extension

## License
MIT © [afmicc](https://github.com/afmicc)

**Enjoy!**

replaceSelection((text) => {

            return `            
            /*
            create function ${text}(in_id int) returns json
    language sql
as
$$
select row_to_json(t)
from (select id,
address,
avatar_url,
gender,
name,
nick_name,
note,
open_id,
phone,
user_type,
creation_time,
updated_time,
message
from "user" as u) as t;
$$;

            create function ${text}() returns SETOF json
            language sql
            as
            $$
            select json_agg(t)
            from (select name,
                thumbnail,
                updated_time
            from coach) as t;
            $$;
*/


            func ${upperCamel(text)}(db *sql.DB, w http.ResponseWriter, r *http.Request) {
                crossOrigin(w)
                /*
                if !checkAdministratorPermission(db, r) {
                    http.NotFound(w, r)
                    return
                }
                */
                q := r.URL.Query()
                id := q.Get("id")
                queryJson(db, w, r, "select * from ${text}($1)",id)
            }


        case "/api/${text.replaceAll('_', '.').slice(1)}":
            app.AdminUserQuery(db, w, r)
            break
            async function fetchAdminUserQuery() {
                const res = await fetch(\`\${baseUri}/api/${text.replaceAll('_', '.').slice(1)}?id=\${id}\`)
                const obj = await res.json();
                return obj;
            }
            func ${upperCamel(text)}(db *sql.DB, w http.ResponseWriter, r *http.Request) {
                crossOrigin(w)
                /*
                    if !checkAdministratorPermission(db, r) {
                        http.NotFound(w, r)
                        return
                    }
                */
                buf, err := ioutil.ReadAll(r.Body)
                if !checkErr(err, w) {
                    return
                }
                queryJson(db, w, r, "select * from ${text}($1)", buf)
            }
            
            `
        })
"# Visual-Studio-Code-Extension" 
