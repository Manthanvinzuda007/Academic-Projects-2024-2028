#include <stdio.h>
#include <stdlib.h>


struct Node {
    int key;
    struct Node *left;
    struct Node *right;
    int height;
};

// Utility to get the height of a node
int height(struct Node *n) {
    return (n == NULL) ? 0 : n->height;
}

// Utility to get max of two integers
int max(int a, int b) {
    return (a > b) ? a : b;
}

// Helper to create a new node
struct Node* newNode(int key) {
    struct Node* node = (struct Node*)malloc(sizeof(struct Node));
    if (!node) exit(1);
    node->key = key;
    node->left = node->right = NULL;
    node->height = 1; // New node is initially added at leaf
    return node;
}

// Right Rotate (used when left-heavy)
struct Node *rightRotate(struct Node *y) {
    struct Node *x = y->left;
    struct Node *T2 = x->right;

    // Perform rotation
    x->right = y;
    y->left = T2;

    // Update heights
    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;

    return x; // New root
}

// Left Rotate (used when right-heavy)
struct Node *leftRotate(struct Node *x) {
    struct Node *y = x->right;
    struct Node *T2 = y->left;

    // Perform rotation
    y->left = x;
    x->right = T2;

    // Update heights
    x->height = max(height(x->left), height(x->right)) + 1;
    y->height = max(height(y->left), height(y->right)) + 1;

    return y; // New root
}

// Get Balance factor of node N
int getBalance(struct Node *N) {
    return (N == NULL) ? 0 : height(N->left) - height(N->right);
}

//  Insert + Balance
struct Node* insert(struct Node* node, int key) {
    // 1. Normal BST insertion
    if (node == NULL) return newNode(key);

    if (key < node->key)
        node->left = insert(node->left, key);
    else if (key > node->key)
        node->right = insert(node->right, key);
    else // Duplicate keys not allowed in AVL
        return node;

    // 2. Update height of this ancestor node
    node->height = 1 + max(height(node->left), height(node->right));

    // 3. Get the balance factor to check if it became unbalanced
    int balance = getBalance(node);

    // If unbalanced, there are 4 cases:

    // Case 1: Left Left
    if (balance > 1 && key < node->left->key)
        return rightRotate(node);

    // Case 2: Right Right
    if (balance < -1 && key > node->right->key)
        return leftRotate(node);

    // Case 3: Left Right
    if (balance > 1 && key > node->left->key) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }

    // Case 4: Right Left
    if (balance < -1 && key < node->right->key) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }

    return node;
}

// Helper: Find node with minimum value (for deletion)
struct Node* minValueNode(struct Node* node) {
    struct Node* current = node;
    while (current->left != NULL)
        current = current->left;
    return current;
}

// Delete + Rebalance
struct Node* deleteNode(struct Node* root, int key) {
    if (root == NULL) return root;

    if (key < root->key)
        root->left = deleteNode(root->left, key);
    else if (key > root->key)
        root->right = deleteNode(root->right, key);
    else {
        // Node with only one child or no child
        if ((root->left == NULL) || (root->right == NULL)) {
            struct Node *temp = root->left ? root->left : root->right;

            if (temp == NULL) { // No child case
                temp = root;
                root = NULL;
            } else // One child case
                *root = *temp; // Copy contents
            free(temp);
        } else {
            // Node with two children: Get inorder successor
            struct Node* temp = minValueNode(root->right);
            root->key = temp->key;
            root->right = deleteNode(root->right, temp->key);
        }
    }

    if (root == NULL) return root;

    // Update height
    root->height = 1 + max(height(root->left), height(root->right));

    // Rebalance
    int balance = getBalance(root);

    if (balance > 1 && getBalance(root->left) >= 0)
        return rightRotate(root);

    if (balance > 1 && getBalance(root->left) < 0) {
        root->left = leftRotate(root->left);
        return rightRotate(root);
    }

    if (balance < -1 && getBalance(root->right) <= 0)
        return leftRotate(root);

    if (balance < -1 && getBalance(root->right) > 0) {
        root->right = rightRotate(root->right);
        return leftRotate(root);
    }

    return root;
}

void preOrder(struct Node *root) {
    if (root != NULL) {
        printf("%d (h:%d) ", root->key, root->height);
        preOrder(root->left);
        preOrder(root->right);
    }
}

int main() {
    struct Node *root = NULL;

    printf("--- SELF-BALANCING AVL TREE ---\n");
    
    // Testing with sequential data that would break a normal BST
    int data[] = {10, 20, 30, 40, 50, 25};
    int n = sizeof(data)/sizeof(data[0]);

    for(int i=0; i<n; i++) {
        printf("Inserting %d...\n", data[i]);
        root = insert(root, data[i]);
    }

    printf("\nPre-order traversal of balanced tree:\n");
    preOrder(root);

    printf("\n\nDeleting 30...\n");
    root = deleteNode(root, 30);

    printf("Pre-order traversal after deletion:\n");
    preOrder(root);
    printf("\n");

    return 0;
}
