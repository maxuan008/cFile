var str = "( {60b9b320-dcba-11e7-b1c9-436bb234de5d:ae4c4ac0-dcbb-11e7-b1c9-436bb234de5d}*{60b9b320-dcba-11e7-b1c9-436bb234de5d:c4638120-dcbb-11e7-b1c9-436bb234de5d} )+( {a5d1b020-dcba-11e7-b1c9-436bb234de5d:e63d46a0-dcbb-11e7-b1c9-436bb234de5d}*{a5d1b020-dcba-11e7-b1c9-436bb234de5d:e976c6c0-dcbb-11e7-b1c9-436bb234de5d} )";

r = str.match(/{.+?:.+?}/g);

console.log(r);

for( var i=0; i<r.length; i++ ) { var tmpA = r[i].replace(/{|}/g, ""); console.log(tmpA); tmpArr = tmpA.split(":"); console.log(tmpArr);  }

console.log(eval("(1+2)*(3+4)"));



