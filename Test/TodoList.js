const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  
  describe("TodoList", function () {
    const TASK_CREATION_COST = ethers.parseEther("0.01");
  
    // Fixture pour déployer le contrat et initialiser les comptes
    async function deployTodoListFixture() {
      const [owner, addr1] = await ethers.getSigners();
      const TodoList = await ethers.deployContract("TodoList");
      return { todoList: TodoList, owner, addr1 };
    }
  
    it("Should set the correct owner", async function () {
      const { todoList, owner } = await loadFixture(deployTodoListFixture);
      const contractOwner = await todoList.runner.getAddress();
      expect(contractOwner).to.equal(owner.address);
    });
  
    it("Should create a new task when paid correctly", async function () {
      const { todoList, addr1 } = await loadFixture(deployTodoListFixture);
      await todoList.connect(addr1).createTask("Learn Solidity", { value: TASK_CREATION_COST });
  
      const tasks = await todoList.readTask();
      expect(tasks.length).to.equal(1);
      expect(tasks[0].description).to.equal("Learn Solidity");
      expect(tasks[0].state).to.equal(0); // TaskState.TODO
    });
  
    it("Should not create a task without correct payment", async function () {
      const { todoList, addr1 } = await loadFixture(deployTodoListFixture);
      await expect(
        todoList.connect(addr1).createTask("Learn Hardhat", { value: ethers.parseEther("0.005") })
      ).to.be.revertedWith("You must send exactly 0.01 ether to create a task");
    });
  
    it("Should update an existing task", async function () {
      const { todoList } = await loadFixture(deployTodoListFixture);
      await todoList.createTask("Task 1", { value: TASK_CREATION_COST });
      await todoList.updateTask(0, "Updated Task 1", 1); // TaskState.DOING
  
      const tasks = await todoList.readTask();
      expect(tasks[0].description).to.equal("Updated Task 1");
      expect(tasks[0].state).to.equal(1); // TaskState.DOING
    });
  
    it("Should not update a non-existent task", async function () {
      const { todoList } = await loadFixture(deployTodoListFixture);
      await expect(todoList.updateTask(0, "Non-existent task", 1)).to.be.revertedWith(
        "Task does not exist"
      );
    });
  
    it("Should delete a task and refund the payment", async function () {
      const { todoList, addr1 } = await loadFixture(deployTodoListFixture);
      await todoList.connect(addr1).createTask("Task to delete", { value: TASK_CREATION_COST });
  
      const initialBalance = BigInt(await ethers.provider.getBalance(addr1.address));
      const tx = await todoList.connect(addr1).deleteTask(0);
      const receipt = await tx.wait();
  
      const gasUsed = receipt.gasUsed ? BigInt(receipt.gasUsed.toString()) : BigInt(0);
      const effectiveGasPrice = receipt.effectiveGasPrice
        ? BigInt(receipt.effectiveGasPrice.toString())
        : BigInt(0);
      const gasCost = gasUsed * effectiveGasPrice;
  
      const finalBalance = BigInt(await ethers.provider.getBalance(addr1.address));
  
      expect(finalBalance + gasCost).to.be.closeTo(
        initialBalance + BigInt(TASK_CREATION_COST),
        BigInt(ethers.parseEther("0.0001"))
      );
  
      const tasks = await todoList.readTask();
      expect(tasks.length).to.equal(0);
    });
  
    it("Should not delete a non-existent task", async function () {
      const { todoList } = await loadFixture(deployTodoListFixture);
      await expect(todoList.deleteTask(0)).to.be.revertedWith("Task does not exist");
    });
  
    it("Should return all tasks", async function () {
      const { todoList } = await loadFixture(deployTodoListFixture);
      await todoList.createTask("Task 1", { value: TASK_CREATION_COST });
      await todoList.createTask("Task 2", { value: TASK_CREATION_COST });
  
      const tasks = await todoList.readTask();
      expect(tasks.length).to.equal(2);
      expect(tasks[0].description).to.equal("Task 1");
      expect(tasks[1].description).to.equal("Task 2");
    });
  
    it("Should allow the owner to view the contract balance", async function () {
      const { todoList } = await loadFixture(deployTodoListFixture);
      await todoList.createTask("Task 1", { value: TASK_CREATION_COST });
      const balance = await todoList.getContractBalance();
  
      expect(balance).to.equal(TASK_CREATION_COST);
    });
  
    it("Should not allow non-owners to view the contract balance", async function () {
      const { todoList, addr1 } = await loadFixture(deployTodoListFixture);
      await expect(todoList.connect(addr1).getContractBalance()).to.be.revertedWith(
        "Only the contract owner can perform this action"
      );
    });
  });
  