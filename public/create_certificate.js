const recipientInput = document.getElementById('recipientName');
const courseInput    = document.getElementById('courseName');
const dateInput      = document.getElementById('issueDate');
const purposeInput   = document.getElementById('purposeText');
const templateName   = document.getElementById('templateName');

const placeholderContainer   = document.getElementById('placeholderContainer');
const addPlaceholderBtn      = document.getElementById('addPlaceholderBtn');
const clearPlaceholdersBtn   = document.getElementById('clearPlaceholdersBtn');
const previewBtn             = document.getElementById('previewBtn');
const resetBtn               = document.getElementById('resetBtn');

const previewNodes = document.querySelectorAll('[data-placeholder]');

function syncMainFields() {
  previewNodes.forEach(node => {
    const key = node.getAttribute('data-placeholder');
    if (key === 'Recipient name') {
      node.textContent = recipientInput.value || 'Recipient name';
    } else if (key === 'Course') {
      node.textContent = courseInput.value || 'Course';
    } else if (key === 'Issue date') {
      node.textContent = dateInput.value || 'Issue date';
    } else if (key === 'Purpose/description') {
      node.textContent = purposeInput.value || 'Purpose/description';
    } else if (key === 'Template name') {
      node.textContent = templateName.value || 'Template name';
    }
  });
}

[recipientInput, courseInput, dateInput, purposeInput].forEach(el => {
  el.addEventListener('input', syncMainFields);
  el.addEventListener('change', syncMainFields);
});

let placeholderCount = 0;

function addPlaceholderInput(initialName = '') {
  placeholderCount++;
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const label = document.createElement('label');
  label.textContent = 'Placeholder' + placeholderCount + '_name';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = initialName;
  input.placeholder = 'Type placeholder text to replace';
  input.addEventListener('input', updateDynamicPlaceholders);
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  placeholderContainer.appendChild(wrapper);
}

function updateDynamicPlaceholders() {
  syncMainFields();

  const nameInputs = placeholderContainer.querySelectorAll('input');
  nameInputs.forEach(inp => {
    const nameValue = inp.value.trim();
    if (!nameValue) return;

    previewNodes.forEach(node => {
      const original = node.getAttribute('data-placeholder');
      if (original.toLowerCase() === nameValue.toLowerCase()) {
        node.textContent = nameValue;
      }
    });
  });
}

addPlaceholderBtn.addEventListener('click', () => {
  addPlaceholderInput();
});

clearPlaceholdersBtn.addEventListener('click', () => {
  placeholderContainer.innerHTML = '';
  placeholderCount = 0;
  syncMainFields();
});

previewBtn.addEventListener('click', () => {
  syncMainFields();
  updateDynamicPlaceholders();
});

resetBtn.addEventListener('click', () => {
  recipientInput.value = '';
  courseInput.value = '';
  dateInput.value = '';
  purposeInput.value = '';
  placeholderContainer.innerHTML = '';
  placeholderCount = 0;
  syncMainFields();
});

syncMainFields();
