import RoomManager from "./managers/RoomManager";
import "./server/server";

// function calculateLevel(xp: number, baseXP: number, ratio: number): number {
//     // Початковий рівень
//     let level = 1;
//     // Поки отримана кількість досвіду більша або рівна кількості досвіду для поточного рівня
//     while (xp >= baseXP) {
//         level++;
//         // Розрахунок кількості досвіду для наступного рівня з урахуванням геометричної прогресії
//         baseXP = Math.floor(baseXP * ratio);
//         // Віднімаємо кількість досвіду для поточного рівня
//         xp -= baseXP;
//     }
//     return level;
// }

// // Приклад використання
// const xp = 1500; // Отримана кількість досвіду
// const baseXP = 100; // Початкова кількість досвіду для першого рівня
// const ratio = 1.5; // Коефіцієнт геометричної прогресії
// const level = calculateLevel(xp, baseXP, ratio);
// console.log(`Ваш рівень: ${level}`);