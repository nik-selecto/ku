import { wsInitialization } from './ws-initialization';

async function main() {
    await wsInitialization();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
