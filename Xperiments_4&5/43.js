#!/usr/bin/env node

// Import readline module for CLI input/output
const readline = require("readline");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Array to store employee data
let employees = [];

// Function to show the menu
function showMenu() {
  console.log(`
=========================================
     EMPLOYEE MANAGEMENT SYSTEM (CLI)
=========================================
1. Add Employee
2. View All Employees
3. Search Employee
4. Update Employee
5. Delete Employee
6. Exit
`);
  rl.question("Enter your choice (1-6): ", handleMenu);
}

// 1️⃣ Add Employee
function addEmployee() {
  rl.question("Enter Employee ID: ", (id) => {
    // Check if ID already exists
    if (employees.find((e) => e.id === id)) {
      console.log("⚠️ Employee with this ID already exists!");
      return showMenu();
    }

    rl.question("Enter Employee Name: ", (name) => {
      rl.question("Enter Department: ", (department) => {
        rl.question("Enter Salary: ", (salary) => {
          employees.push({
            id,
            name,
            department,
            salary: parseFloat(salary),
          });
          console.log("✅ Employee added successfully!");
          showMenu();
        });
      });
    });
  });
}

// 2️⃣ View All Employees
function viewEmployees() {
  console.log("\n📋 Employee List:");
  if (employees.length === 0) {
    console.log("No employees found.");
  } else {
    console.table(employees);
  }
  showMenu();
}

// 3️⃣ Search Employee
function searchEmployee() {
  rl.question("Enter Employee ID to search: ", (id) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      console.log("\n🔍 Employee Found:");
      console.table([emp]);
    } else {
      console.log("❌ Employee not found!");
    }
    showMenu();
  });
}

// 4️⃣ Update Employee
function updateEmployee() {
  rl.question("Enter Employee ID to update: ", (id) => {
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) {
      console.log("❌ Employee not found!");
      return showMenu();
    }

    const emp = employees[index];
    console.log(`Editing Employee: ${emp.name}`);

    rl.question(`Enter new Name (${emp.name}): `, (name) => {
      rl.question(`Enter new Department (${emp.department}): `, (department) => {
        rl.question(`Enter new Salary (${emp.salary}): `, (salary) => {
          employees[index] = {
            id: emp.id,
            name: name || emp.name,
            department: department || emp.department,
            salary: salary ? parseFloat(salary) : emp.salary,
          };
          console.log("✅ Employee updated successfully!");
          showMenu();
        });
      });
    });
  });
}

// 5️⃣ Delete Employee
function deleteEmployee() {
  rl.question("Enter Employee ID to delete: ", (id) => {
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) {
      console.log("❌ Employee not found!");
    } else {
      employees.splice(index, 1);
      console.log("🗑️ Employee deleted successfully!");
    }
    showMenu();
  });
}

// Handle menu input
function handleMenu(choice) {
  switch (choice.trim()) {
    case "1":
      addEmployee();
      break;
    case "2":
      viewEmployees();
      break;
    case "3":
      searchEmployee();
      break;
    case "4":
      updateEmployee();
      break;
    case "5":
      deleteEmployee();
      break;
    case "6":
      console.log("👋 Exiting... Goodbye!");
      rl.close();
      break;
    default:
      console.log("⚠️ Invalid choice! Please enter 1-6.");
      showMenu();
  }
}

// Start the app
showMenu();
