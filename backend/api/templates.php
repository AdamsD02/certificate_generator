<?php 
session_start();

require_once __DIR__ . '/../config/db_config.php';

try {
    if (isset($_POST['action'])) {
        $action = $_POST['action'];
        switch ($action) {
            case 'create':
                # Save template in DB
                if ( empty($_POST['tname']) || empty($_POST['orientation']) || empty($_POST['html_code']) ) {
                    header('Content-Type: application/json');
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Required fields missing.'
                    ]);
                    exit();
                }
                save_template($conn);
                break;

            case 'edit':
                # Update template in DB
                header('Content-Type: application/json');

                if (empty($_POST['id'])) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Template not passed.'
                    ]);
                    exit();
                }
                if (empty($__POST['tname']) || empty($_POST['orientation']) || empty($_POST['html_code']) ) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Required fields missing.'
                    ]);
                    exit();
                }

                update_template($conn);
                break;

            case 'delete':
                # Delete template from DB
                if (!isset($_POST['id'])) {
                    header('Content-Type: application/json');
                    echo json_encode([
                        'status'=> 'error',
                        'message' => 'Template not passed.'
                    ]);
                    exit();
                }

                delete_template($conn);
                break;

            case 'list':
                # List templates onto Dashboard
                list_templates($conn);
                break;

            case 'use':
                # sets the Template-ID into Session
                header('Content-Type: application/json');
                if (isset($_POST['id'])) {
                    $_SESSION['use_id'] = $_POST['id'];

                    echo json_encode([
                        'status' => 'success',
                        'message' => 'data ready'
                    ]);
                    exit();
                }

                echo json_encode([
                    'status'=> 'error',
                    'message' => 'Template not passed.'
                ]);
                exit();
                break;

            case 'id_selected':
                # Returns data of Template-ID in Session 
                if (isset($_SESSION['use_id'])) {
                    get_template($conn);
                }

                header('Content-Type: application/json');
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Template not found'
                ]);
                exit();
                break;
            
            default:
                header('Content-Type: application/json');
                echo json_encode([
                    "status" => "error",
                    "message" => "Invalid action."
                ]);
                exit();
                break;
        }
    }
} catch (\Throwable $th) {
    //throw $th;
}

function get_template($conn) {
    $id = $_SESSION['use_id'];

    header('Content-Type: application/json');
    
    $query = 'SELECT * FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$row = $result->fetch_assoc()) {
        echo json_encode([
            "status" => "error",
            "message" => "No Template Data available."
        ]);
        exit();
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Retrieved Template Successfuly.',
        'data' => [
            'tname' => $row['t_name'],
            'orientation' => $row['orientation'],
            'html_code' => $row['html_code'],
            'bg_img' => $row['bg_img'] ?? '',
            'opacity' => $row['opacity'] ?? ''
        ]
    ]);
    exit();
}

function delete_template($conn) {
    header('Content-Type: application/json');

    $id = $_POST['id'];

    // First check if template exists
    $checkQuery = 'SELECT t_id FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result->fetch_assoc()) {
        echo json_encode([
            "status" => "error",
            "message" => "Template does not exist."
        ]);
        exit();
    }

    // Delete query
    $deleteQuery = 'DELETE FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($deleteQuery);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Template deleted successfully."
        ]);
        exit();
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete template."
        ]);
        exit();
    }
}

function save_template($conn) {
    header('Content-Type: application/json');

    $tname = $_POST['tname'];
    $orientation = $_POST['orientation'];
    $html_code = $_POST['html_code'];
    $bg_img = $_POST['bg_img'] ?? '';
    $opacity = $_POST['opacity'] ?? '';

    $query = "INSERT INTO templates (t_name, orientation, html_code, bg_img, opacity)
            VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sssss', $tname, $orientation, $html_code, $bg_img, $opacity);

    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Template saved successfully.',
            'template_id' => $stmt->insert_id
        ]);
        exit();
    }

    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to save template.'
    ]);
    exit();
}

function update_template($conn) {
    $id = $_POST['id'];
    $tname = $_POST['tname'];
    $orientation = $_POST['orientation'];
    $html_code = $_POST['html_code'];

    $bg_img = $_POST['bg_img'] ?? '';
    $opacity = $_POST['opacity'] ?? '';

    $query = "UPDATE templates 
            SET t_name = ?, orientation = ?, html_code = ?, bg_img = ?, opacity = ?
            WHERE t_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sssssi', $tname, $orientation, $html_code, $bg_img, $opacity, $id);

    header('Content-Type: application/json');
    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Template updated successfully.'
        ]);
        exit();
    }

    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to update template.'
    ]);
    exit();

}

function list_templates($conn) {
    header('Content-Type: application/json');

    $query = "SELECT t_id, t_name, orientation, bg_img, opacity FROM templates";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if no records found
    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "No templates found.",
            "data" => []
        ]);
        exit();
    }

    // Fetch all templates
    $templates = [];
    while ($row = $result->fetch_assoc()) {
        $templates[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "message" => "Templates retrieved successfully.",
        "data" => $templates
    ]);
    exit();
}

?>