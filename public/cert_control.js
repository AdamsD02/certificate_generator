let html_code = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Certificate of Completion</title>
            </head>

            <body style="font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 50px; 
                  background: #f4f4f4;">

                <div style="
                    width: 800px;
                    margin: auto;
                    padding: 40px;
                    background: white;
                    border: 5px solid #555;
                    border-radius: 10px;
                ">
                    <div style="font-size: 32px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
                        Certificate of Completion
                    </div>

                    <div style="font-size: 20px; margin-bottom: 10px;">
                        This is to certify that
                    </div>

                    <div style="font-size: 28px; font-weight: bold; color: #333; margin: 20px 0;">
                        {{student_name}}
                    </div>

                    <div style="font-size: 20px; margin-bottom: 10px;">
                        has successfully completed the
                    </div>

                    <div style="font-size: 28px; font-weight: bold; color: #333; margin: 20px 0;">
                        {{workshop_name}}
                    </div>

                    <div style="font-size: 20px; margin-bottom: 10px;">
                        Duration: <strong>{{duration}}</strong>
                    </div>

                    <div style="margin-top: 40px; font-size: 18px;">
                        Awarded on <strong>{{certified_on}}</strong>
                    </div>

                    <div style="margin-top: 40px; font-size: 18px;">
                        Certified by: <strong>{{certified_by}}</strong>
                    </div>
                </div>

            </body>
            </html>
`;
// html_code = '';

let copy_html_code = html_code;
let template_name = 'Workshop Template';
let t_id = 1;
let orientation = 'landscape';
let bg_img = '';
let opacity = '';

// Form Elements
const recipientInput = document.getElementById('recipientName');
const courseInput    = document.getElementById('courseName');
const dateInput      = document.getElementById('issueDate');
const purposeInput   = document.getElementById('purposeText');

const templateName   = document.getElementById('templateName');

// Dynamic Placeholder Block
const placeholderContainer   = document.getElementById('placeholderContainer');

// Buttons 
const previewBtn = document.getElementById('previewBtn');
const resetBtn   = document.getElementById('resetBtn');

const msgElement = document.getElementById("msg_box");

const certWrapper = document.getElementById('cert-wrapper');
let iframeElement = document.createElement('iframe')
iframeElement.id = 'certificate-iframe';
iframeElement.style.width="100%";
iframeElement.style.boxShadow = '0 2px 5px #555';

const loadPlaceholder = () => {
    const regex = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

    const placeholder_list = html_code.match(regex);
}

// start 
document.addEventListener('load', () => {
    // check template code passed
    if (html_code) {
        iframeElement.srcdoc = html_code;
        certWrapper.appendChild(iframeElement);

        msgElement.style.visibility = 'hidden';
    }
    else {
        iframeElement.sandbox = true;
        iframeElement.style.visibility = 'hidden';
        msgElement.style.visibility = 'visible';
        msgElement.style.fontWeight = 'bold';
    }
})

