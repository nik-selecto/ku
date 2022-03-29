import { initOrderBook } from './order-book.init';

async function mainOrderBook() {
    await initOrderBook();
}

mainOrderBook().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
