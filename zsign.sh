#!/bin/bash
zsign_url="https://github.com/zhlynn/zsign.git"

clone_zsign() {

    output=$(git clone "$zsign_url" zsign 2>&1)
    lines=$(echo "$output" | wc -l)
    count=0

    while IFS= read -r line; do
        count=$((count + 1))
        percentage=$((count * 100 / lines))
        progress="["
        for ((i = 0; i < percentage; i += 2)); do
            progress+="="
        done
        progress+=">"

        echo -ne "Cloning progress: $progress $percentage% \r"
    done <<<"$output"

    echo "Cloning progress: [==================================================> 100%]"
}

platform=$(uname)

# Install required packages
install_packages() {
    if [[ "$platform" == "Darwin" ]]; then
        # macOS
        brew update
        brew install openssl@1.1

        # Add OpenSSL paths to environment variables
        export LDFLAGS="-L/usr/local/Cellar/openssl@1.1/1.1.1u/lib"
        export CPPFLAGS="-I/usr/local/Cellar/openssl@1.1/1.1.1u/include -I/usr/local/Cellar/openssl@1.1/1.1.1u/include"

        # Update pkg-config paths
        sudo cp $(brew --prefix openssl@1.1)/lib/pkgconfig/*.pc /usr/local/lib/pkgconfig/

    elif [[ "$platform" == "Linux" ]]; then
        # Linux
        if [[ -x "$(command -v apt-get)" ]]; then
            # Debian-based distributions
            sudo apt-get update
            sudo apt-get install -y g++ libssl-dev
        elif [[ -x "$(command -v yum)" ]]; then
            # Red Hat-based distributions
            sudo yum update
            sudo yum install -y gcc-c++ openssl-devel
        elif [[ -x "$(command -v dnf)" ]]; then
            # Fedora distributions
            sudo dnf update
            sudo dnf install -y gcc-c++ openssl-devel
        else
            echo "Package manager not found. Please install the required packages manually. (g++ libssl-dev/openssl-devel)"
            exit 1
        fi

        # Configure OpenSSL library path
        export PKG_CONFIG_PATH=/usr/local/ssl/lib/pkgconfig:$PKG_CONFIG_PATH

    else
        echo "Unsupported platform: $platform"
        exit 1
    fi
}

compile_zsign() {
    cd zsign
    g++ *.cpp common/*.cpp -std=gnu++11 -lcrypto -I/usr/local/Cellar/openssl@1.1/1.1.1u/include -L/usr/local/Cellar/openssl@1.1/1.1.1u/lib -O3 -o zsign-exec
    cd ..
    echo "Successfully built zsign"
}

main() {
    clone_zsign
    install_packages
    compile_zsign
    echo "Successfully installed and compiled Zsign"
}

main