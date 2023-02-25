

// addEventListener('message', (event) => {
//     const [finalFrame,
//         videoFrame,
//         keyedFrame] = event.data;

//     for (let i = 0; i < videoFrame.data.length / 4; i++) {
//         if (keyedFrame.data[i * 4 + 3] === 255) {
//             finalFrame.data[i * 4] = keyedFrame.data[i * 4];
//             finalFrame.data[i * 4 + 1] = keyedFrame.data[i * 4 + 1];
//             finalFrame.data[i * 4 + 2] = keyedFrame.data[i * 4 + 2];
//             finalFrame.data[i * 4 + 3] = keyedFrame.data[i * 4 + 3];
//         } else {
//             finalFrame.data[i * 4] = videoFrame.data[i * 4];
//             finalFrame.data[i * 4 + 1] = videoFrame.data[i * 4 + 1];
//             finalFrame.data[i * 4 + 2] = videoFrame.data[i * 4 + 2];
//             finalFrame.data[i * 4 + 3] = videoFrame.data[i * 4 + 3];
//         }
//     }
    
//     postMessage(finalFrame);
// });
