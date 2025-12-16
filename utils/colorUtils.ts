
// Utility to extract dominant color from an image URL
// Utility to extract dominant color from an image URL
export const getDominantColor = async (imageUrl: string): Promise<string> => {
    // Wrap image loading in a promise with a timeout
    const imageLoadPromise = new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve('#18181b'); // Fallback zinc-900

            canvas.width = 1;
            canvas.height = 1;
            
            // Draw image resized to 1x1 to get average color
            try {
                ctx.drawImage(img, 0, 0, 1, 1);
                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                resolve(`rgb(${r}, ${g}, ${b})`);
            } catch (e) {
                // Canvas likely tainted due to CORS
                console.warn("Could not extract color from favicon (CORS)", imageUrl);
                resolve('#18181b');
            }
        };

        img.onerror = () => {
            resolve('#18181b'); // Fallback
        };
    });

    // Create a timeout promise
    const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
            // console.warn("Color extraction timed out", imageUrl);
            resolve('#18181b');
        }, 2000); // 2 second timeout
    });

    // Race them
    return Promise.race([imageLoadPromise, timeoutPromise]);
};

// Generate a complementary gradient based on a single color
export const getGradientFromColor = (color: string): string => {
    // Simple way: mix the color with black/transparent overlays or hue shift
    // For a nice "Apple-like" look, we can use the color as the top-left, 
    // and a darker/hueshifted version at bottom-right.
    
    return `linear-gradient(135deg, ${color} 0%, #18181b 100%)`;
};

// Helper to adjust color brightness/hue if we wanted more complex logic later
// (Keeping it simple for now as requested to avoid bloat)
