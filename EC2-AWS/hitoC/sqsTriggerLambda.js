export const handler = async (event) => {
    console.log('event', event);
    console.log('Trigger Successfully Invoked');
  
    // Sử dụng Promise để tạo delay 20 giây
    await new Promise((resolve) => setTimeout(resolve, 20000)); // 20000 milliseconds = 20 seconds
  
    console.log('Timeout Triggered'); // In ra sau 20 giây
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Lambda completed after 20 seconds!',
      }),
    };
  };