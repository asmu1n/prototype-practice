import { stdin, stdout, exit } from 'node:process';

let name = '';
let age = 0;

stdin.setEncoding('utf8');
getName();

function getName(isRetry: boolean = false) {
    if (isRetry) {
        stdout.write('Please enter your name again: ');
    } else {
        stdout.write('Hello what is your name?');
    }

    console.log();
    stdin.once('data', data => {
        name = data.toString().trim();

        if (!name) {
            console.log('Name cannot be empty');
            getName(true);

            return;
        }

        getAge(name);
    });
}

function getAge(name: string, isRetry: boolean = false) {
    if (isRetry) {
        stdout.write('Please enter your age again: ');
    } else {
        stdout.write(`How old are you, ${name}?`);
    }

    console.log();
    stdin.once('data', data => {
        age = Number(data.toString().trim());

        if (Number.isNaN(age) || age < 0 || age > 150) {
            console.log('Age must be a valid number between 0 and 150');
            getAge(name, true);

            return;
        }

        console.log(`Hello ${name}, you are ${age} years old`);
        exit(0);
    });
}
