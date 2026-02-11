#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *left, *right;
};

// Creates a new node with error handling for memory allocation
struct Node* createNode(int value) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    if (newNode == NULL) {
        fprintf(stderr, "Error: Memory allocation failed!\n");
        exit(1);
    }
    newNode->data = value;
    newNode->left = newNode->right = NULL;
    return newNode;
}

// Recursive insertion
struct Node* insert(struct Node* root, int value) {
    if (root == NULL) return createNode(value);

    if (value < root->data)
        root->left = insert(root->left, value);
    else if (value > root->data)
        root->right = insert(root->right, value);

    return root;
}

// Search function: Returns 1 if found, 0 otherwise
int search(struct Node* root, int key) {
    if (root == NULL) return 0;
    if (root->data == key) return 1;
    
    if (key < root->data)
        return search(root->left, key);
    return search(root->right, key);
}

// Calculate the height of the tree
int getHeight(struct Node* root) {
    if (root == NULL) return -1;
    int leftHeight = getHeight(root->left);
    int rightHeight = getHeight(root->right);
    return (leftHeight > rightHeight ? leftHeight : rightHeight) + 1;
}

// In-order traversal (Sorted)
void printInOrder(struct Node* root) {
    if (root != NULL) {
        printInOrder(root->left);
        printf("[%d] ", root->data);
        printInOrder(root->right);
    }
}

// Memory Cleanup (Post-order traversal)
// This prevents memory leaks by freeing nodes from the bottom up
void freeTree(struct Node* root) {
    if (root == NULL) return;
    freeTree(root->left);
    freeTree(root->right);
    free(root);
}

int main() {
    struct Node* root = NULL;
    int values[] = {50, 30, 70, 20, 40, 60, 80};
    int n = sizeof(values) / sizeof(values[0]);

    printf("--- Binary Search Tree Management ---\n");
    
    // 1. Building the tree
    printf("Inserting %d nodes...\n", n);
    for(int i = 0; i < n; i++) {
        root = insert(root, values[i]);
    }

    // 2. Displaying the tree
    printf("\nSorted Data: ");
    printInOrder(root);
    printf("\n");

    // 3. Tree Statistics
    printf("\nTree Statistics:");
    printf("\n- Height of Tree: %d", getHeight(root));
    printf("\n- Root Element: %d", root->data);
    printf("\n");

    // 4. Search Demonstration
    int testVal = 40;
    printf("\nSearching for %d: %s", testVal, search(root, testVal) ? "FOUND" : "NOT FOUND");
    testVal = 99;
    printf("\nSearching for %d: %s", testVal, search(root, testVal) ? "FOUND" : "NOT FOUND");
    printf("\n");

    // 5. Cleanup
    printf("\nCleaning up memory... ");
    freeTree(root);
    root = NULL;
    printf("Done.\n");

    return 0;
}
